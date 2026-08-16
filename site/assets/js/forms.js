(() => {
  const form = document.querySelector('[data-audit-form]');
  const status = form?.querySelector('[data-audit-form-status]');
  const submit = form?.querySelector('.audit-submit');
  if (!form || !status || !submit) return;

  const setStatus = (state, message) => {
    status.hidden = false;
    status.classList.remove('is-sending', 'is-success', 'is-error');
    status.classList.add(`is-${state}`);
    status.textContent = message;
  };

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
    setStatus('sending', 'Sending your request…');

    try {
      const body = new FormData(form);
      body.append('action', 'stapleit_audit');

      const response = await fetch('/wp-admin/admin-ajax.php', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body,
        credentials: 'same-origin'
      });

      const raw = await response.text();
      let payload = {};

      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch (_) {
        throw new Error('WordPress returned an invalid response. Please try again.');
      }

      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.message || 'We could not send your request. Please try again.');
      }

      setStatus(
        'success',
        payload.message || 'Thanks — your audit request has been received. We’ll get back to you within one working day.'
      );
      form.reset();
    } catch (error) {
      setStatus(
        'error',
        error instanceof Error
          ? error.message
          : 'We could not send your request. Please try again or email hello@stapleit.co.uk.'
      );
    } finally {
      submit.disabled = false;
      submit.textContent = defaultLabel;
      form.removeAttribute('aria-busy');
    }
  }, true);
})();
