(() => {
  const card = document.querySelector('[data-support-status]');
  if (!card) return;

  const pill = card.querySelector('[data-support-state]');
  const message = card.querySelector('[data-support-message]');
  const availability = card.querySelector('[data-support-availability]');
  const checked = card.querySelector('[data-support-checked]');
  const timeZone = 'Europe/London';
  const dayIndex = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6, Sunday:7 };

  const partsFor = date => Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday:'long',
      hour:'2-digit',
      minute:'2-digit',
      hourCycle:'h23'
    }).formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value])
  );

  const nextLabel = (weekday, hour) => {
    const day = dayIndex[weekday];
    if (day <= 5 && hour < 9) return 'Today · 9:00 AM';
    if (day <= 4 && hour >= 17) return 'Tomorrow · 9:00 AM';
    if (day === 5 && hour >= 17) return 'Monday · 9:00 AM';
    if (day === 6) return 'Monday · 9:00 AM';
    if (day === 7) return 'Monday · 9:00 AM';
    return '9:00 AM';
  };

  const update = () => {
    const now = new Date();
    const parts = partsFor(now);
    const weekday = parts.weekday;
    const hour = Number(parts.hour);
    const day = dayIndex[weekday];
    const online = day <= 5 && hour >= 9 && hour < 17;

    card.dataset.state = online ? 'online' : 'offline';
    pill.textContent = online ? 'Online' : 'Offline';

    if (online) {
      message.textContent = 'We’re online — the support team is available until 5:00 PM.';
      availability.textContent = 'Now · until 5:00 PM';
    } else if (day >= 6) {
      message.textContent = 'It’s the weekend — we’ll be back online Monday at 9:00 AM.';
      availability.textContent = 'Monday · 9:00 AM';
    } else if (hour < 9) {
      message.textContent = 'We’re not open just yet — support starts today at 9:00 AM.';
      availability.textContent = 'Today · 9:00 AM';
    } else {
      message.textContent = day === 5
        ? 'We’re offline for the weekend — back Monday at 9:00 AM.'
        : 'We’re offline for the day — back tomorrow at 9:00 AM.';
      availability.textContent = nextLabel(weekday, hour);
    }

    checked.textContent = `Updated ${new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour:'numeric',
      minute:'2-digit'
    }).format(now)}`;
  };

  update();
  window.setInterval(update, 60000);
})();
