import { siteConfig } from './config.js';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const assessmentLinks = document.querySelectorAll('[data-assessment-link]');
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

if (siteConfig.assessmentUrl) {
  assessmentLinks.forEach((link) => {
    link.href = siteConfig.assessmentUrl;
  });
}

document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
  const subject = link.getAttribute('href').split('?')[1];
  link.href = `mailto:${siteConfig.contactEmail}${subject ? `?${subject}` : ''}`;
});
document.querySelectorAll('.email-link').forEach((link) => {
  link.textContent = siteConfig.contactEmail;
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
