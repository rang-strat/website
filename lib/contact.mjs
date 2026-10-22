import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

const services = new Set(['', 'Data Strategy & Advisory', 'Data Architecture & Data Pipeline Design', 'Implementation & Delivery', 'AI Readiness', 'Other']);
const successMessage = 'Thank you. Your inquiry has been received. Henry will follow up with you.';
const unavailableMessage = 'We could not receive your message. Please try again or email henryz@rangstrategies.com.';
const bodyLimit = 16384;

function json(status, message, extra = {}) {
  return Response.json({ success: status >= 200 && status < 300, message, ...extra }, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

async function readBody(request) {
  if (Number(request.headers.get('content-length')) > bodyLimit) throw new Error('body_too_large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid_json');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > bodyLimit) {
        await reader.cancel();
        throw new Error('body_too_large');
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const limits = { name: 100, email: 254, company: 160, phone: 40, jobTitle: 120, serviceInterest: 80, message: 5000 };
  const values = {};
  for (const [field, maximum] of Object.entries(limits)) {
    if (typeof input[field] !== 'string') return null;
    const value = input[field].trim();
    if (value.length > maximum || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value)) return null;
    if (field !== 'message' && /[\r\n]/.test(value)) return null;
    values[field] = value;
  }
  if (!values.name || !values.company || values.message.length < 10) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return null;
  if (!services.has(values.serviceInterest) || input.contactConsent !== true || typeof input.marketingOptIn !== 'boolean') return null;
  if (typeof input.submissionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.submissionId)) return null;
  return { ...values, email: values.email.toLowerCase(), submissionId: input.submissionId, marketingOptIn: input.marketingOptIn };
}

function notificationText(lead) {
  return [
    'New Rang Strategies website inquiry',
    `Lead ID: ${lead.id}`,
    `Received: ${lead.created_at}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company}`,
    `Phone: ${lead.phone || 'Not supplied'}`,
    `Job title: ${lead.job_title || 'Not supplied'}`,
    `Service: ${lead.service_interest || 'Not specified'}`,
    `Marketing opt-in: ${lead.marketing_opt_in ? 'Yes' : 'No'}`,
    '',
    'Message:',
    lead.message,
  ].join('\n');
}

export function createContactHandler({ env = process.env, fetcher = fetch, logger = console } = {}) {
  return async function handleContact(request) {
    if (request.method !== 'POST') {
      const response = json(405, 'Please submit the contact form.');
      response.headers.set('Allow', 'POST');
      return response;
    }
    if (request.headers.get('origin') !== new URL(request.url).origin) return json(403, unavailableMessage);
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json(415, 'Please submit the contact form.');
    let input;
    try {
      input = await readBody(request);
    } catch (error) {
      return json(error.message === 'body_too_large' ? 413 : 400, 'Please check your information and try again.');
    }
    if (typeof input?.website !== 'string') return json(400, 'Please check your information and try again.');
    if (input.website.trim()) return json(200, successMessage);
    const values = validate(input);
    if (!values) return json(400, 'Please complete the required fields with valid information and agree to be contacted.');
    let supabaseUrl;
    try {
      supabaseUrl = new URL(env.SUPABASE_URL);
      if (supabaseUrl.protocol !== 'https:' || !supabaseUrl.hostname.endsWith('.supabase.co') || supabaseUrl.username || supabaseUrl.password || !env.SUPABASE_SECRET_KEY) throw new Error('configuration');
    } catch {
      logger.error('Contact storage configuration is missing or invalid.');
      return json(503, unavailableMessage);
    }
    const address = (request.headers.get(env.VERCEL === '1' ? 'x-vercel-forwarded-for' : 'x-forwarded-for') || '').split(',')[0].trim();
    if (env.VERCEL === '1' && !isIP(address)) {
      logger.error('Trusted client address is unavailable.');
      return json(503, unavailableMessage);
    }
    const ipHash = createHmac('sha256', env.SUPABASE_SECRET_KEY).update(address || 'local').digest('hex');
    const storageHeaders = { apikey: env.SUPABASE_SECRET_KEY, 'Content-Type': 'application/json' };
    const storageUrl = `${supabaseUrl.origin}/rest/v1`;
    let lead;
    try {
      const response = await fetcher(`${storageUrl}/rpc/capture_website_lead`, {
        method: 'POST', headers: storageHeaders, signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          p_submission_id: values.submissionId, p_name: values.name, p_email: values.email,
          p_company: values.company, p_phone: values.phone, p_job_title: values.jobTitle,
          p_service_interest: values.serviceInterest, p_message: values.message,
          p_marketing_opt_in: values.marketingOptIn, p_ip_hash: ipHash,
        }),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        if (failure.code === 'P0001' && failure.message === 'contact_rate_limit') return json(429, 'You have sent several inquiries recently. Please wait 15 minutes or contact Henry by email.');
        throw new Error('storage_failed');
      }
      lead = await response.json();
      if (!lead?.id || !lead.email || !lead.created_at) throw new Error('invalid_receipt');
    } catch {
      logger.error('Contact inquiry could not be saved.');
      return json(503, unavailableMessage);
    }
    if (lead.notification_status === 'sent') return json(200, successMessage);
    let delivery = { notification_status: 'failed' };
    try {
      const from = env.CONTACT_FROM_EMAIL;
      const recipient = env.CONTACT_TO_EMAIL || 'henryz@rangstrategies.com';
      if (!env.RESEND_API_KEY || !from || /[\r\n]/.test(from + recipient)) throw new Error('email_configuration');
      const response = await fetcher('https://api.resend.com/emails', {
        method: 'POST', signal: AbortSignal.timeout(6000),
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `website-lead-${lead.id}` },
        body: JSON.stringify({ from, to: [recipient], reply_to: lead.email, subject: 'New Rang Strategies website inquiry', text: notificationText(lead) }),
      });
      if (!response.ok) throw new Error('email_failed');
      const receipt = await response.json();
      if (!receipt.id) throw new Error('invalid_delivery_receipt');
      delivery = { notification_status: 'sent', notification_id: receipt.id, notified_at: new Date().toISOString() };
    } catch {
      logger.error('Contact inquiry was saved; notification delivery needs attention.');
    }
    try {
      const response = await fetcher(`${storageUrl}/website_leads?id=eq.${encodeURIComponent(lead.id)}&notification_status=neq.sent`, {
        method: 'PATCH', headers: { ...storageHeaders, Prefer: 'return=minimal' },
        signal: AbortSignal.timeout(5000), body: JSON.stringify(delivery),
      });
      if (!response.ok) throw new Error('delivery_status_failed');
    } catch {
      logger.error('Contact notification status could not be updated; inquiry remains saved.');
    }
    return json(200, successMessage);
  };
}
