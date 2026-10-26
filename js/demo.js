(function () {
  const RESET_OPTION = { label: 'Reiniciar demo', action: 'reset' };
  const MAX_VISIBLE_MESSAGES = 5;

  const STAGE_OPTIONS = {
    start: [
      { label: 'Oi', action: 'hello' },
      { label: 'Ver horários de funcionamento', action: 'business-hours' },
      { label: 'Ver preços', action: 'prices-start' },
      RESET_OPTION,
    ],
    intent: [
      { label: 'Ver horários', action: 'availability' },
      { label: 'Ver preços', action: 'prices-intent' },
      { label: 'Começar agendamento', action: 'schedule-start' },
      RESET_OPTION,
    ],
    afterHours: [
      { label: 'Ver preços', action: 'prices-intent' },
      { label: 'Começar agendamento', action: 'schedule-start' },
      RESET_OPTION,
    ],
    afterPrices: [
      { label: 'Ver horários', action: 'availability' },
      { label: 'Começar agendamento', action: 'schedule-start' },
      RESET_OPTION,
    ],
    schedule: [
      { label: 'Sim, depois das 16h', action: 'after-16' },
      { label: 'Ver outro horário', action: 'other-time' },
      RESET_OPTION,
    ],
    chooseTime: [
      { label: 'Escolher 16h30', action: 'choose-1630' },
      { label: 'Escolher 18h', action: 'choose-18' },
      RESET_OPTION,
    ],
    otherTime: [
      { label: 'Tarde', action: 'afternoon' },
      { label: 'Noite', action: 'night' },
      RESET_OPTION,
    ],
    final: [RESET_OPTION],
  };

  const ACTIONS = {
    hello: {
      client: 'Oi',
      ai: 'Oi! 👋 Posso te ajudar com horários, preços ou agendamento. O que você gostaria de fazer?',
      nextStage: 'intent',
      status: 'ready',
    },
    'business-hours': {
      client: 'Quais são os horários de funcionamento?',
      ai: 'Atendemos de segunda a sábado, das 9h às 19h. Quer ver horários disponíveis para agendar?',
      nextStage: 'afterHours',
      status: 'hours',
    },
    'prices-start': {
      client: 'Quais são os preços?',
      ai: 'O corte masculino está a partir de R$ 35. Também temos barba, sobrancelha e combos. Quer iniciar um agendamento?',
      nextStage: 'afterPrices',
      status: 'prices',
    },
    availability: {
      client: 'Quero ver os horários.',
      ai: 'Hoje ainda temos opções depois das 16h. Quer começar um agendamento?',
      nextStage: 'afterHours',
      status: 'hours',
    },
    'prices-intent': {
      client: 'Quero ver os preços.',
      ai: 'O corte masculino está a partir de R$ 35. Também posso mostrar barba, sobrancelha e combos.',
      nextStage: 'afterPrices',
      status: 'prices',
    },
    'schedule-start': {
      client: 'Quero agendar.',
      ai: 'Perfeito. Você quer agendar para hoje depois das 16h?',
      nextStage: 'schedule',
      status: 'scheduleStart',
    },
    'after-16': {
      client: 'Sim, depois das 16h.',
      ai: 'Encontrei 16h30 e 18h disponíveis. Qual horário prefere?',
      nextStage: 'chooseTime',
      status: 'hours',
    },
    'other-time': {
      client: 'Quero outro horário.',
      ai: 'Sem problema. Posso procurar opções pela manhã, tarde ou noite.',
      nextStage: 'otherTime',
      status: 'hours',
    },
    afternoon: {
      client: 'Tarde.',
      ai: 'Para a tarde, posso procurar opções entre 14h e 18h. Hoje ainda encontrei 16h30 disponível.',
      nextStage: 'chooseTime',
      status: 'hours',
    },
    night: {
      client: 'Noite.',
      ai: 'Para a noite, encontrei 18h como opção disponível hoje.',
      nextStage: 'chooseTime',
      status: 'hours',
    },
    'choose-1630': {
      client: '16h30.',
      ai: 'Perfeito! Vou deixar 16h30 pré-reservado. Agora só falta informar o nome do cliente para confirmar.',
      nextStage: 'final',
      status: 'booking1630',
    },
    'choose-18': {
      client: '18h.',
      ai: 'Perfeito! Vou deixar 18h pré-reservado. Agora só falta informar o nome do cliente para confirmar.',
      nextStage: 'final',
      status: 'booking18',
    },
  };

  const STATUS = {
    ready: {
      title: 'Demo pronta',
      main: 'Escolha uma opção para iniciar a simulação.',
      detail: '',
    },
    prices: {
      title: 'Consulta respondida',
      main: 'Cliente recebeu informações de preço.',
      detail: '',
    },
    hours: {
      title: 'Horários consultados',
      main: 'Cliente recebeu horários de funcionamento/disponibilidade.',
      detail: '',
    },
    scheduleStart: {
      title: 'Agendamento em andamento',
      main: 'Horário: aguardando escolha',
      detail: 'Status: aguardando horário',
    },
    booking1630: {
      title: 'Agendamento em andamento',
      main: 'Horário: 16h30',
      detail: 'Status: aguardando nome',
    },
    booking18: {
      title: 'Agendamento em andamento',
      main: 'Horário: 18h',
      detail: 'Status: aguardando nome',
    },
  };

  function getTimeLabel() {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  }

  function initDemo() {
    const messages = document.getElementById('demoMessages');
    const options = document.getElementById('demoOptions');
    const statusCard = document.getElementById('bookingStatus');
    const statusTitle = document.getElementById('bookingStatusTitle');
    const statusMain = document.getElementById('bookingTime');
    const statusDetail = document.getElementById('bookingState');

    if (!messages || !options) return;

    let stage = 'start';
    let isBusy = false;

    function scrollMessages() {
      messages.scrollTop = messages.scrollHeight;
    }

    function trimMessages() {
      const bubbles = messages.querySelectorAll('.bubble:not(.typing)');
      const overflow = bubbles.length - MAX_VISIBLE_MESSAGES;

      if (overflow <= 0) return;

      Array.from(bubbles)
        .slice(0, overflow)
        .forEach((bubble) => bubble.remove());
    }

    function clearMessages() {
      messages.textContent = '';
    }

    function addMessage(text, type) {
      const bubble = document.createElement('div');
      const time = document.createElement('small');

      bubble.className = `bubble ${type}`;
      bubble.textContent = text;
      time.textContent = getTimeLabel();
      bubble.appendChild(time);
      messages.appendChild(bubble);
      trimMessages();
      scrollMessages();
      return bubble;
    }

    function showTyping() {
      const typing = document.createElement('div');
      typing.className = 'bubble ai typing';
      typing.textContent = 'Atendente IA está digitando...';
      messages.appendChild(typing);
      scrollMessages();
      return typing;
    }

    function setStatus(statusName) {
      const status = STATUS[statusName] || STATUS.ready;

      if (!statusCard || !statusTitle || !statusMain || !statusDetail) return;

      statusCard.hidden = false;
      statusTitle.textContent = status.title;
      statusMain.textContent = status.main;
      statusDetail.textContent = status.detail;
      statusDetail.hidden = !status.detail;
    }

    function setOptionsDisabled(disabled) {
      options.querySelectorAll('button').forEach((button) => {
        button.disabled = disabled;
      });
    }

    function renderOptions(nextStage) {
      const optionList = STAGE_OPTIONS[nextStage] || STAGE_OPTIONS.start;

      options.textContent = '';
      optionList.forEach((item) => {
        const button = document.createElement('button');
        button.className = item.action === 'reset' ? 'quick-reply ghost' : 'quick-reply';
        button.type = 'button';
        button.dataset.demoAction = item.action;
        button.textContent = item.label;
        button.disabled = isBusy;
        options.appendChild(button);
      });
    }

    function renderIntro() {
      addMessage('Teste uma conversa simulada do Atendente IA escolhendo uma das opções abaixo.', 'ai');
    }

    function resetDemo() {
      stage = 'start';
      isBusy = false;
      clearMessages();
      setStatus('ready');
      renderIntro();
      renderOptions(stage);
    }

    function playAction(actionName) {
      if (isBusy) return;

      if (actionName === 'reset') {
        resetDemo();
        return;
      }

      const action = ACTIONS[actionName];
      if (!action) return;

      isBusy = true;
      setOptionsDisabled(true);
      addMessage(action.client, 'client');

      const typing = showTyping();
      window.setTimeout(() => {
        typing.remove();
        addMessage(action.ai, 'ai');
        stage = action.nextStage;
        setStatus(action.status);
        isBusy = false;
        renderOptions(stage);
      }, 420);
    }

    options.addEventListener('click', (event) => {
      const button = event.target.closest('[data-demo-action]');
      if (!button || !options.contains(button)) return;

      playAction(button.dataset.demoAction || 'reset');
    });

    resetDemo();
  }

  window.MarcosSite = window.MarcosSite || {};
  window.MarcosSite.initDemo = initDemo;
})();
