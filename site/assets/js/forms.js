(() => {
  const forms = document.querySelectorAll('[data-audit-form], [data-enquiry-form]');
  if (!forms.length) return;

  forms.forEach(form => {
    const status = form.querySelector('[data-audit-form-status], [data-enquiry-status]');
    const submit = form.querySelector('.audit-submit, [data-enquiry-submit]');
    if (!status || !(submit instanceof HTMLButtonElement)) return;

    const action = form.dataset.enquiryAction || 'stapleit_audit';
    const sendingMessage = action === 'stapleit_support_enquiry'
      ? 'Sending your enquiry…'
      : 'Sending your request…';
    const fallbackMessage = action === 'stapleit_support_enquiry'
      ? 'Thanks — your enquiry has been received. We’ll get back to you within one working day.'
      : 'Thanks — your audit request has been received. We’ll get back to you within one working day.';
    const defaultLabel = submit.textContent;

    const setStatus = (state, message) => {
      status.hidden = false;
      status.classList.remove('is-sending', 'is-success', 'is-error');
      status.classList.add(`is-${state}`);
      status.textContent = message;
    };

    form.addEventListener('submit', async event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (!form.reportValidity()) return;

      submit.disabled = true;
      submit.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');
      setStatus('sending', sendingMessage);

      try {
        const body = new FormData(form);
        body.set('action', action);

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

        setStatus('success', payload.message || fallbackMessage);
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
  });
})();
