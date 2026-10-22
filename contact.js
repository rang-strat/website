const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');
const submitButton = document.querySelector('#contact-submit');
let submissionId;
submitButton.disabled = false;

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity() || submitButton.disabled) return;
  contactStatus.textContent = '';
  contactStatus.dataset.state = '';
  if (location.protocol === 'file:') {
    contactStatus.textContent = 'This local preview does not send messages. Please email henryz@rangstrategies.com to get in touch.';
    contactStatus.focus();
    return;
  }
  submissionId ||= crypto.randomUUID();
  const fields = new FormData(contactForm);
  const payload = {
    submissionId, name: fields.get('name'), email: fields.get('email'), company: fields.get('company'),
    phone: fields.get('phone'), jobTitle: fields.get('jobTitle'), serviceInterest: fields.get('serviceInterest'),
    message: fields.get('message'), contactConsent: fields.get('contactConsent') === 'on',
    marketingOptIn: fields.get('marketingOptIn') === 'on', website: fields.get('website'),
  };
  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
  contactForm.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error(result.message || 'Please try again or email henryz@rangstrategies.com.');
    contactStatus.textContent = result.message;
    contactStatus.dataset.state = 'success';
    contactForm.reset();
    submissionId = undefined;
  } catch (error) {
    contactStatus.textContent = error.name === 'TypeError' || error.name === 'TimeoutError' ? 'We could not confirm receipt. Please try again or email henryz@rangstrategies.com.' : error.message;
    contactStatus.dataset.state = 'error';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send inquiry <span aria-hidden="true">↗</span>';
    contactForm.removeAttribute('aria-busy');
    contactStatus.focus();
  }
});
