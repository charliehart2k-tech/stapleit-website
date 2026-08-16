(() => {
  const form = document.querySelector('[data-audit-form]');
  const status = form?.querySelector('[data-audit-form-status]');
  const submit = form?.querySelector('.audit-submit');
  if (!form || !status || !submit) return;

  const honeypot = document.createElement('input');
  honeypot.type = 'text';
  honeypot.name = 'website';
  honeypot.tabIndex = -1;
  honeypot.autocomplete = 'off';
  honeypot.setAttribute('aria-hidden', 'true');
  honeypot.style.position = 'absolute';
  honeypot.style.left = '-10000px';
  honeypot.style.width = '1px';
  honeypot.style.height = '1px';
  honeypot.style.opacity = '0';
  form.appendChild(honeypot);

  const defaultLabel = submit.textContent;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!form.reportValidity()) return;

    submit.disabled = true;
    submit.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.hidden = false;
    status.textContent = 'Sending your request…';

    try {
      const response = await fetch('/wp-json/stapleit/v1/audit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
        credentials: 'same-origin'
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'We could not send your request. Please try again.');
      }

      status.textContent = payload.message || 'Thanks — your audit request has been received. We’ll get back to you within one working day.';
      form.reset();
    } catch (error) {
      status.textContent = error instanceof Error
        ? error.message
        : 'We could not send your request. Please try again or email hello@stapleit.co.uk.';
    } finally {
      submit.disabled = false;
      submit.textContent = defaultLabel;
      form.removeAttribute('aria-busy');
    }
  }, true);
})();
