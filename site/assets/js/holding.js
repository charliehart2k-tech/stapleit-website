(() => {
  'use strict';

  const access = document.querySelector('.holding-access');
  const status = document.querySelector('[data-holding-login-status]');
  if (!(access instanceof HTMLDetailsElement) || !(status instanceof HTMLElement)) return;

  const state = new URLSearchParams(window.location.search).get('login');
  const messages = {
    failed: 'Those details were not recognised. Please check them and try again.',
    locked: 'Too many attempts. Please wait 15 minutes before trying again.',
    invalid: 'That sign-in request expired. Please open the padlock and try again.'
  };

  if (state && messages[state]) {
    access.open = true;
    status.textContent = messages[state];
    status.hidden = false;
    const user = document.querySelector('#holding-user');
    if (user instanceof HTMLInputElement) user.focus();
    window.history.replaceState({}, document.title, window.location.pathname + '#preview-login');
  }
})();
