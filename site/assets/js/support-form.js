(function(){
  const form=document.getElementById('support-form');
  const status=document.getElementById('support-form-status');
  if(!form||!status)return;

  form.addEventListener('submit',function(event){
    event.preventDefault();

    const honeypot=form.querySelector('input[name="website"]');
    if(honeypot && honeypot.value.trim()){
      status.classList.add('error');
      status.textContent='Your enquiry could not be validated.';
      return;
    }

    const required=[...form.querySelectorAll('[required]')];
    const missing=required.some(el=>el.type==='checkbox'?!el.checked:!el.value.trim());
    const email=form.querySelector('input[type="email"]');
    const emailOK=email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const bad=missing||!emailOK;

    status.classList.toggle('error',bad);
    status.textContent=bad
      ? 'Please complete all required fields and enter a valid email address.'
      : 'Staging preview only — the form is valid, but submission is not connected here. Please call 01372 309 707 or email hello@stapleit.co.uk.';
  });
})();
