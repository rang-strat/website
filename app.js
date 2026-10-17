import { siteConfig } from './config.js';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const assessmentLink = document.querySelector('#assessment-link');
const assessmentDialog = document.querySelector('#assessment-details');
const mobileViewport = window.matchMedia('(max-width: 680px)');

navigation.dataset.collapsible = 'true';
menuToggle.hidden = !mobileViewport.matches;

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  navigation.classList.toggle('is-open', isOpen);
});

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

mobileViewport.addEventListener('change', (event) => {
  menuToggle.hidden = !event.matches;
  closeMenu();
});

if (assessmentLink && siteConfig.assessmentUrl) {
  assessmentLink.href = siteConfig.assessmentUrl;
  assessmentLink.firstChild.textContent = 'Start the questionnaire ';
  document.querySelector('#assessment-status').hidden = true;
} else if (assessmentLink) {
  assessmentLink.addEventListener('click', (event) => {
    event.preventDefault();
    assessmentDialog.showModal();
  });
}

document.querySelector('.dialog-close')?.addEventListener('click', () => assessmentDialog.close());
assessmentDialog?.addEventListener('click', (event) => {
  const bounds = assessmentDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
    assessmentDialog.close();
  }
});

document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
  const subject = link.getAttribute('href').split('?')[1];
  link.href = `mailto:${siteConfig.contactEmail}${subject ? `?${subject}` : ''}`;
});
document.querySelectorAll('.email-link').forEach((link) => {
  link.textContent = siteConfig.contactEmail;
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
