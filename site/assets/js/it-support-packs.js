/* Adaptive, Cora-led add-on conversation for the IT Support route. */
(() => {
  const form = document.querySelector('[data-pack-finder]');
  if (!(form instanceof HTMLFormElement)) return;

  const stage = form.querySelector('[data-pack-finder-stage]');
  const allQuestions = [...form.querySelectorAll('[data-pack-question]')];
  const gateway = form.querySelector('[data-pack-gateway]');
  const questions = allQuestions.filter(question => question !== gateway);
  const questionByKey = new Map(allQuestions.map(question => [question.dataset.packKey, question]));
  const count = form.querySelector('[data-pack-finder-count]');
  const coraLine = form.querySelector('[data-pack-cora-line]');
  const backButton = form.querySelector('[data-pack-finder-back]');
  const suggestButton = form.querySelector('[data-pack-finder-suggest]');
  const nextButton = form.querySelector('[data-pack-finder-next]');
  const results = form.querySelector('[data-pack-results]');
  const resultsHeading = form.querySelector('#support-pack-results-title');
  const resultsSummary = form.querySelector('[data-pack-results-summary]');
  const resultsEmpty = form.querySelector('[data-pack-results-empty]');
  const reviewButton = form.querySelector('[data-pack-finder-review]');
  const resultRows = [...form.querySelectorAll('[data-pack-result]')];
  const coraChat = form.querySelector('[data-packs-cora-chat]');

  if (
    !stage || !(gateway instanceof HTMLFieldSetElement) || !questions.length || !count || !coraLine ||
    !(backButton instanceof HTMLButtonElement) || !(suggestButton instanceof HTMLButtonElement) ||
    !(nextButton instanceof HTMLButtonElement) || !results || !resultsHeading || !resultsSummary || !resultsEmpty ||
    !(reviewButton instanceof HTMLButtonElement) || resultRows.length !== questions.length
  ) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const routes = {
    security: ['security', 'governance', 'cyber-essentials', 'disaster-recovery'],
    infrastructure: ['server', 'azure', 'network', 'disaster-recovery'],
    future: ['ai', 'strategy', 'disaster-recovery', 'security'],
    guide: ['security', 'governance', 'network', 'disaster-recovery', 'strategy']
  };
  const focusLines = {
    security: 'Got it — I’ll start with protection and anything you may need to evidence.',
    infrastructure: 'Okay — I’ll work out which parts of the environment may need their own management.',
    future: 'Got it — I’ll look at where AI, planning or resilience might genuinely help.',
    guide: 'No problem — I’ll keep it broad and only go deeper where what you tell me points.'
  };
  let history = ['focus'];
  let historyIndex = 0;
  let currentKey = 'focus';

  const selectedAnswer = question => question?.querySelector('input[type="radio"]:checked')?.value || '';
  const packAnswers = () => questions
    .map(question => [question.dataset.packKey, selectedAnswer(question)])
    .filter(([, answer]) => answer);
  const answerObject = () => Object.fromEntries(packAnswers());
  const currentQuestion = () => questionByKey.get(currentKey);
  const selectedFocus = () => selectedAnswer(gateway) || 'guide';
  const naturalList = items => {
    if (items.length < 2) return items[0] || '';
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
  };
  const shouldSkip = key => key === 'cyber-essentials' && selectedAnswer(questionByKey.get('governance')) === 'no';
  const nextQuestionKey = () => {
    const route = routes[selectedFocus()] || routes.guide;
    const position = route.indexOf(currentKey);
    const answered = new Set(packAnswers().map(([key]) => key));
    for (let index = position >= 0 ? position + 1 : 0; index < route.length; index += 1) {
      const key = route[index];
      if (!shouldSkip(key) && !answered.has(key)) return key;
    }
    return '';
  };
  const enoughToSuggest = () => {
    const answers = packAnswers().map(([, answer]) => answer);
    const signals = answers.filter(answer => answer === 'yes' || answer === 'unsure').length;
    return answers.length >= 4 || answers.length >= 3 || (answers.length >= 2 && signals >= 2);
  };
  const updateCoraLine = (lastKey = '', lastAnswer = '') => {
    if (currentKey === 'focus' && !selectedAnswer(gateway)) {
      coraLine.textContent = 'I’ll ask only what seems useful. You can stop as soon as you have enough to work with.';
      return;
    }
    if (lastKey === 'focus') {
      coraLine.textContent = focusLines[selectedFocus()] || focusLines.guide;
      return;
    }
    if (enoughToSuggest()) {
      coraLine.textContent = 'I’ve got enough to suggest a starting point without pretending I know your whole environment.';
      return;
    }
    if (lastAnswer === 'yes') {
      coraLine.textContent = 'That’s useful. I’ll follow the related thread rather than run through everything.';
    } else if (lastAnswer === 'unsure') {
      coraLine.textContent = 'That’s fine. I’ll treat it as something to discuss, not a definite need.';
    } else if (lastAnswer === 'no') {
      coraLine.textContent = 'Good to know. I’ll leave that out and move to the next thing that may matter.';
    }
  };
  const updateControls = () => {
    const answers = packAnswers();
    const currentAnswer = selectedAnswer(currentQuestion());
    if (currentKey === 'focus') {
      count.textContent = 'Cora · start wherever feels closest';
    } else if (answers.length <= 1) {
      count.textContent = 'Cora · getting a feel for your setup';
    } else if (enoughToSuggest()) {
      count.textContent = 'Cora · enough to suggest a starting point';
    } else {
      count.textContent = 'Cora · narrowing it down';
    }
    backButton.hidden = historyIndex === 0;
    suggestButton.hidden = answers.length < 2;
    nextButton.disabled = !currentAnswer;
    if (currentKey === 'focus') {
      nextButton.textContent = 'Start there';
    } else {
      nextButton.textContent = enoughToSuggest() || !nextQuestionKey() ? 'See what Cora suggests' : 'Keep chatting';
    }
  };
  const showQuestion = (key, { direction = 'forward', focus = true } = {}) => {
    currentKey = key;
    form.dataset.packDirection = direction;
    allQuestions.forEach(question => { question.hidden = question.dataset.packKey !== key; });
    stage.hidden = false;
    results.hidden = true;
    updateControls();
    if (focus) window.requestAnimationFrame(() => currentQuestion()?.querySelector('legend')?.focus());
  };
  const goForward = key => {
    history = history.slice(0, historyIndex + 1);
    if (history.at(-1) !== key) history.push(key);
    historyIndex = history.length - 1;
    showQuestion(key);
  };
  const resultSummaryText = (likelyNames, considerNames) => {
    if (likelyNames.length && considerNames.length) {
      return `${naturalList(likelyNames)} ${likelyNames.length === 1 ? 'stands' : 'stand'} out from what you’ve told me. ${naturalList(considerNames)} ${considerNames.length === 1 ? 'is' : 'are'} worth clarifying.`;
    }
    if (likelyNames.length) {
      return `${naturalList(likelyNames)} ${likelyNames.length === 1 ? 'stands' : 'stand'} out from what you’ve told me.`;
    }
    if (considerNames.length) {
      return `${naturalList(considerNames)} ${considerNames.length === 1 ? 'is' : 'are'} worth clarifying because you were not sure.`;
    }
    return 'Nothing you’ve told me so far makes an add-on obvious — and I would rather say that than add something for the sake of it.';
  };
  const showResults = () => {
    const likelyNames = [];
    const considerNames = [];
    resultRows.forEach(row => {
      const key = row.dataset.packResult;
      const answer = selectedAnswer(questionByKey.get(key));
      const status = row.querySelector('[data-pack-result-status]');
      const matched = answer === 'yes' || answer === 'unsure';
      row.hidden = !matched;
      if (!matched || !status) return;
      const name = row.querySelector('h4')?.textContent?.replace(/ pack$/i, '').trim() || key;
      if (answer === 'yes') {
        likelyNames.push(name);
        row.dataset.match = 'likely';
        status.textContent = 'Suggested';
      } else {
        considerNames.push(name);
        row.dataset.match = 'consider';
        status.textContent = 'Worth clarifying';
      }
    });
    const resultCount = likelyNames.length + considerNames.length;
    resultsHeading.textContent = resultCount
      ? `${resultCount} ${resultCount === 1 ? 'area stands' : 'areas stand'} out so far`
      : 'Nothing obvious stands out yet';
    resultsSummary.textContent = resultSummaryText(likelyNames, considerNames);
    resultsEmpty.hidden = resultCount > 0;
    const packSummary = resultRows
      .filter(row => !row.hidden)
      .map(row => `${row.querySelector('h4')?.textContent?.trim()}: ${row.querySelector('[data-pack-result-status]')?.textContent?.trim()}`)
      .filter(Boolean);
    window.stapleitPlanner = window.stapleitPlanner || {};
    window.stapleitPlanner.packs = packSummary;
    window.dispatchEvent(new CustomEvent('stapleit:planner-update'));
    window.stapleitTrack?.('pack_finder_completed');
    if (coraChat instanceof HTMLButtonElement) {
      const names = [...likelyNames, ...considerNames];
      coraChat.dataset.coraMessage = names.length
        ? `From our quick add-on conversation you suggested ${naturalList(names)}. Can you talk me through why?`
        : 'Nothing stood out in our quick add-on conversation. What else would you ask before deciding whether I need anything extra?';
    }
    stage.hidden = true;
    results.hidden = false;
    delete form.dataset.packDirection;
    window.requestAnimationFrame(() => resultsHeading.focus({ preventScroll: false }));
  };

  allQuestions.forEach(question => question.addEventListener('change', () => {
    updateControls();
    updateCoraLine(currentKey, selectedAnswer(question));
  }));
  nextButton.addEventListener('click', () => {
    const question = currentQuestion();
    const answer = selectedAnswer(question);
    if (!answer) return;
    if (currentKey === 'focus') {
      window.stapleitTrack?.('pack_finder_started');
      updateCoraLine('focus', answer);
      const nextKey = nextQuestionKey();
      if (nextKey) goForward(nextKey); else showResults();
      return;
    }
    updateCoraLine(currentKey, answer);
    const nextKey = nextQuestionKey();
    if (enoughToSuggest() || !nextKey) showResults();
    else goForward(nextKey);
  });
  suggestButton.addEventListener('click', () => {
    if (packAnswers().length >= 2) showResults();
  });
  backButton.addEventListener('click', () => {
    if (historyIndex === 0) return;
    historyIndex -= 1;
    showQuestion(history[historyIndex], { direction: 'back' });
    updateCoraLine();
  });
  reviewButton.addEventListener('click', () => {
    showQuestion(history[historyIndex], { direction: 'back' });
    updateCoraLine();
  });
  form.addEventListener('submit', event => event.preventDefault());

  allQuestions.forEach(question => { question.hidden = question !== gateway; });
  results.hidden = true;
  form.classList.add('is-enhanced', 'is-conversational');
  showQuestion('focus', { focus: false });
  if (reducedMotion.matches) delete form.dataset.packDirection;
})();
