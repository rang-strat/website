import { createContactHandler } from '../lib/contact.mjs';

export const maxDuration = 30;
export default { fetch: createContactHandler() };
