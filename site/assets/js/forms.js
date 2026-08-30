(() => {
  const forms = document.querySelectorAll('[data-audit-form], [data-enquiry-form]');
  if (!forms.length) return;

  forms.forEach(form => {
    const status = form.querySelector('[data-audit-form-status], [data-enquiry-status]');
    const submit = form.querySelector('.audit-submit, [data-enquiry-submit]');
    if (!status || !(submit instanceof HTMLButtonElement)) return;

    const action = form.dataset.enquiryAction || 'stapleit_audit';
    const messages = {
      stapleit_contact_enquiry: {
        sending: 'Sending your message…',
        success: 'Thanks — your message has been received. We’ll get back to you as soon as possible.'
      },
      stapleit_support_enquiry: {
        sending: 'Sending your enquiry…',
        success: 'Thanks — your enquiry has been received. We’ll get back to you within one working day.'
      },
      stapleit_audit: {
        sending: 'Sending your request…',
        success: 'Thanks — your audit request has been received. We’ll get back to you within one working day.'
      }
    };
    const messageSet = messages[action] || messages.stapleit_audit;
    const sendingMessage = messageSet.sending;
    const fallbackMessage = messageSet.success;
    const submitLabel = submit.querySelector('[data-enquiry-submit-label]');
    const defaultLabel = submitLabel instanceof HTMLElement ? submitLabel.textContent : submit.textContent;
    const setSubmitLabel = value => {
      if (submitLabel instanceof HTMLElement) submitLabel.textContent = value;
      else submit.textContent = value;
    };
    const requirements = form.querySelector('textarea[name="requirements"]');
    if (requirements instanceof HTMLTextAreaElement) {
      const plannerSummary = sessionStorage.getItem('stapleitPlannerSummary');
      if (plannerSummary && !requirements.value) requirements.value = plannerSummary;
    }

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
      setSubmitLabel('Sending…');
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
        if (action === 'stapleit_audit') sessionStorage.removeItem('stapleitPlannerSummary');
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
        setSubmitLabel(defaultLabel);
        form.removeAttribute('aria-busy');
      }
    }, true);
  });
})();
