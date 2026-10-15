/**
 * PROMPTOS ESSENCIAL — LANDING PAGE CONTROLLER
 * Arquitetura leve, mobile-first, sem dependências externas.
 * Respeita integralmente as regras de privacidade, homologação e A/B testing do Briefing.
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. CONFIGURAÇÃO CENTRAL DE HOMOLOGAÇÃO E PRODUÇÃO
     ========================================================================== */
  const PROMPTOS_CONFIG = {
    productName: 'PromptOS Essencial',
    priceBRL: 47.90,
    /**
     * IMPORTANTE (Briefing Seção 2 e 9):
     * Não inventar URL de pagamento. Enquanto estiver vazia (""), os CTAs abrem
     * o modal transparente de homologação (Staging) e registram o evento de clique.
     * Quando o responsável pelo checkout fornecer a URL oficial, basta preenchê-la aqui.
     */
    checkoutUrl: '',
    supportEmail: 'suporte@promptos.com.br',
    companyLegalText:
      'PPMT / PromptOS • Dados empresariais (Razão Social / CNPJ) e canal oficial de suporte configuráveis para homologação antes da publicação comercial.',
    defaultHeadline: 'a', // 'a' | 'b'
    defaultDemo: 'a',     // 'a' | 'b'
    defaultCounts: 'confirmed' // 'confirmed' (150/12/8) | 'conservative'
  };

  /* ==========================================================================
     2. CAMADA DE MENSURAÇÃO PRIVACY-SAFE COM DEDUPLICAÇÃO (Briefing Seção 8)
     ========================================================================== */
  const firedUniqueEvents = new Set();
  const SENSITIVE_KEYS = /email|e-mail|cpf|cnpj|phone|telefone|celular|nome|name|card|cartao|senha|password|token/i;

  function sanitizePayload(rawPayload = {}) {
    const clean = {};
    Object.keys(rawPayload).forEach((key) => {
      if (!SENSITIVE_KEYS.test(key)) {
        const val = rawPayload[key];
        if (typeof val === 'string' && val.includes('@')) {
          return; // Nunca registrar e-mails em eventos de analytics
        }
        clean[key] = val;
      }
    });
    return clean;
  }

  function trackEvent(eventName, payload = {}, options = { deduplicate: false }) {
    const dedupeKey = `${eventName}:${payload.location || 'global'}`;
    if (options.deduplicate && firedUniqueEvents.has(dedupeKey)) {
      return;
    }
    if (options.deduplicate) {
      firedUniqueEvents.add(dedupeKey);
    }

    const eventData = {
      event: eventName,
      product: 'promptos_essencial',
      price: PROMPTOS_CONFIG.priceBRL,
      headline_variant: document.documentElement.getAttribute('data-headline') || 'a',
      demo_variant: document.documentElement.getAttribute('data-demo') || 'a',
      viewport_w: window.innerWidth,
      timestamp: new Date().toISOString(),
      ...sanitizePayload(payload)
    };

    // Integração pronta para Google Tag Manager / dataLayer / Pixel (quando homologado)
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(eventData);
    }

    if (window.location.search.includes('debug=1')) {
      console.info('[PromptOS Analytics]', eventData);
    }
  }

  /* ==========================================================================
     3. TESTES A/B E PARÂMETROS DE URL (Briefing Seção 6 e 8)
     ========================================================================== */
  function initVariants() {
    const params = new URLSearchParams(window.location.search);
    const htmlEl = document.documentElement;

    const headlineParam = params.get('headline') || params.get('ab');
    const demoParam = params.get('demo');
    const countsParam = params.get('counts');
    const stagingParam = params.get('staging');

    const headline = headlineParam === 'b' ? 'b' : PROMPTOS_CONFIG.defaultHeadline;
    const demo = demoParam === 'b' ? 'b' : PROMPTOS_CONFIG.defaultDemo;
    const counts = countsParam === 'conservative' ? 'conservative' : PROMPTOS_CONFIG.defaultCounts;

    htmlEl.setAttribute('data-headline', headline);
    htmlEl.setAttribute('data-demo', demo);
    htmlEl.setAttribute('data-counts', counts);

    const selectHeadline = document.getElementById('select-headline');
    const selectDemo = document.getElementById('select-demo');
    const selectCounts = document.getElementById('select-counts');
    const stagingBar = document.getElementById('staging-bar');
    const btnHideStaging = document.getElementById('btn-hide-staging');

    if (stagingParam === '0' && stagingBar) {
      stagingBar.hidden = true;
    }

    if (selectHeadline) {
      selectHeadline.value = headline;
      selectHeadline.addEventListener('change', (e) => {
        htmlEl.setAttribute('data-headline', e.target.value);
        trackEvent('ab_variant_switch', { type: 'headline', value: e.target.value });
      });
    }

    if (selectDemo) {
      selectDemo.value = demo;
      selectDemo.addEventListener('change', (e) => {
        htmlEl.setAttribute('data-demo', e.target.value);
        trackEvent('ab_variant_switch', { type: 'demo', value: e.target.value });
      });
    }

    if (selectCounts) {
      selectCounts.value = counts;
      selectCounts.addEventListener('change', (e) => {
        htmlEl.setAttribute('data-counts', e.target.value);
        trackEvent('ab_variant_switch', { type: 'counts', value: e.target.value });
      });
    }

    if (btnHideStaging && stagingBar) {
      btnHideStaging.addEventListener('click', () => {
        stagingBar.hidden = true;
      });
    }
  }

  /* ==========================================================================
     4. INTERATIVIDADE: SEÇÃO 06 (ANTES E DEPOIS) E BOTÕES DE CÓPIA
     ========================================================================== */
  const SCENARIOS = {
    loja: {
      before:
        '“Crie um post legal para minha loja de roupas para eu postar hoje no Instagram e atrair clientes.”',
      afterHtml:
        'Atue como estrategista de <mark>[Moda Feminina]</mark>. Crie 3 posts sobre <mark>[alfaiataria confortável]</mark> para <mark>[mulheres de 28–45 anos]</mark> focados em <mark>[vendas no Direct]</mark>, com gancho e CTA.',
      afterPlain:
        'Atue como estrategista de [Moda Feminina]. Crie 3 posts sobre [alfaiataria confortável] para [mulheres de 28–45 anos] focados em [vendas no Direct], com gancho e CTA.'
    },
    servico: {
      before:
        '“Faça uma mensagem boa para oferecer meu serviço de reforma pelo WhatsApp para conseguir clientes.”',
      afterHtml:
        'Atue como consultor de <mark>[Arquitetura Residencial]</mark>. Crie 3 mensagens de WhatsApp para <mark>[casais com imóvel na planta]</mark> focadas em <mark>[agendar diagnóstico]</mark> sem parecer robô.',
      afterPlain:
        'Atue como consultor de [Arquitetura Residencial]. Crie 3 mensagens de WhatsApp para [casais com imóvel na planta] focadas em [agendar diagnóstico] sem parecer robô.'
    },
    b2b: {
      before:
        '“Escreva uma proposta comercial para apresentar meu serviço de marketing para uma clínica médica.”',
      afterHtml:
        'Atue como especialista B2B em <mark>[Gestão de Tráfego]</mark>. Estruture proposta para <mark>[clínicas médicas]</mark> focada em <mark>[agendamentos particulares]</mark> com escopo, etapas e próximos passos.',
      afterPlain:
        'Atue como especialista B2B em [Gestão de Tráfego]. Estruture proposta para [clínicas médicas] focada em [agendamentos particulares] com escopo, etapas e próximos passos.'
    }
  };

  let currentScenarioKey = 'loja';
  let toastTimeout = null;

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.hidden = true;
    }, 2800);
  }

  function copyTextToClipboard(text, successMsg, originLabel) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        showToast(successMsg);
      });
    } else {
      showToast(successMsg);
    }
    trackEvent('demo_prompt_copy', { location: originLabel });
  }

  function initInteractiveDemos() {
    const scenarioBtns = document.querySelectorAll('.scenario-btn');
    const beforeEl = document.getElementById('before-prompt-text');
    const afterEl = document.getElementById('after-prompt-text');
    const copyComparisonBtn = document.getElementById('btn-copy-comparison');
    const heroCopyBtn = document.getElementById('hero-demo-copy-btn');

    scenarioBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-scenario');
        if (!key || !SCENARIOS[key]) return;
        currentScenarioKey = key;

        scenarioBtns.forEach((b) => {
          const isCurrent = b === btn;
          b.classList.toggle('is-active', isCurrent);
          b.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        });

        if (beforeEl) beforeEl.textContent = SCENARIOS[key].before;
        if (afterEl) afterEl.innerHTML = SCENARIOS[key].afterHtml;

        trackEvent('scenario_switch', { scenario: key });
      });
    });

    if (copyComparisonBtn) {
      copyComparisonBtn.addEventListener('click', () => {
        const scenario = SCENARIOS[currentScenarioKey] || SCENARIOS.loja;
        copyTextToClipboard(
          scenario.afterPlain,
          '✓ Comando estruturado copiado! Cole na sua IA preferida.',
          `comparison_${currentScenarioKey}`
        );
      });
    }

    if (heroCopyBtn) {
      heroCopyBtn.addEventListener('click', () => {
        const sampleHeroPrompt =
          'Atue como especialista em vendas consultivas pelo WhatsApp. Escreva 3 abordagens diretas para pequenos lojistas e autônomos sobre consultoria de organização financeira, com foco em agendar diagnóstico sem usar clichês.';
        copyTextToClipboard(
          sampleHeroPrompt,
          '✓ Exemplo copiado! É assim que você copia seus prompts no PromptOS.',
          'hero_preview'
        );
      });
    }
  }

  /* ==========================================================================
     5. GERENCIAMENTO DE CTAs E CHECKOUT SEGURO (Briefing Seção 2, 7 e 8)
     ========================================================================== */
  function buildDestinationUrl(baseUrl, ctaLocation) {
    try {
      const url = new URL(baseUrl);
      const currentParams = new URLSearchParams(window.location.search);

      // Preserva UTMs da campanha de forma limpa, bloqueando parâmetros sensíveis
      currentParams.forEach((value, key) => {
        if (/^utm_|^src$|^sck$/i.test(key) && !SENSITIVE_KEYS.test(key)) {
          url.searchParams.set(key, value);
        }
      });

      url.searchParams.set('lp_cta', ctaLocation);
      url.searchParams.set('lp_h', document.documentElement.getAttribute('data-headline') || 'a');
      return url.toString();
    } catch (_) {
      return baseUrl;
    }
  }

  function initCheckoutCTAs() {
    const triggers = document.querySelectorAll('.js-checkout-trigger');
    const stagingStateEl = document.getElementById('staging-checkout-state');

    if (PROMPTOS_CONFIG.checkoutUrl && stagingStateEl) {
      stagingStateEl.textContent = 'Checkout Oficial Ativo';
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        const location = trigger.getAttribute('data-cta-location') || 'unknown';

        // Registra o clique com deduplicação por sessão/localização
        trackEvent('cta_click', { location }, { deduplicate: true });

        if (PROMPTOS_CONFIG.checkoutUrl && PROMPTOS_CONFIG.checkoutUrl.trim() !== '') {
          e.preventDefault();
          const finalUrl = buildDestinationUrl(PROMPTOS_CONFIG.checkoutUrl.trim(), location);
          window.location.assign(finalUrl);
        } else {
          // Modo Staging Seguro: Não inventa URL falsa de pagamento
          e.preventDefault();
          const originCode = document.getElementById('checkout-trigger-origin');
          if (originCode) originCode.textContent = location;
          openModal('modal-checkout-staging', trigger);
        }
      });
    });
  }

  /* ==========================================================================
     6. STICKY MOBILE CTA INTELIGENTE (Briefing Seção 5 e 7)
     - Só aparece após passar pelo CTA do Hero (#hero-cta)
     - Esconde-se quando Oferta Final (#oferta-final), FAQ (#faq) ou Rodapé (#footer)
       estão visíveis na tela para nunca encobrir conteúdo final ou rodapé.
     ========================================================================== */
  function initStickyMobileCTA() {
    const stickyBar = document.getElementById('mobile-sticky-cta');
    const stickyBtn = document.getElementById('mobile-sticky-btn');
    const heroCta = document.getElementById('hero-cta');
    const offerSection = document.getElementById('oferta-final');
    const faqSection = document.getElementById('faq');
    const footerSection = document.getElementById('footer');

    if (!stickyBar || !heroCta) return;

    let heroPassed = false;
    let bottomZoneVisible = false;
    let keyboardOpen = false;

    const visibilityMap = new Map();

    function updateStickyState() {
      const shouldShow = heroPassed && !bottomZoneVisible && !keyboardOpen && window.innerWidth < 768;
      stickyBar.classList.toggle('is-visible', shouldShow);
      stickyBar.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
      if (stickyBtn) {
        stickyBtn.setAttribute('tabindex', shouldShow ? '0' : '-1');
      }
    }

    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const rect = entry.boundingClientRect;
            // Só considera que passou pelo Hero CTA quando ele sai pelo topo da tela
            heroPassed = !entry.isIntersecting && rect.top < 0;
            updateStickyState();
          });
        },
        { threshold: 0 }
      );
      heroObserver.observe(heroCta);

      const bottomObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visibilityMap.set(entry.target.id, entry.isIntersecting);
          });
          bottomZoneVisible = Array.from(visibilityMap.values()).some(Boolean);
          updateStickyState();
        },
        { threshold: 0.05 }
      );

      [offerSection, faqSection, footerSection].forEach((section) => {
        if (section) bottomObserver.observe(section);
      });
    }

    // Proteção contra sobreposição de teclado virtual no celular
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        keyboardOpen = window.visualViewport.height < window.innerHeight * 0.75;
        updateStickyState();
      });
    }

    window.addEventListener('resize', updateStickyState, { passive: true });
  }

  /* ==========================================================================
     7. MODAIS ACESSÍVEIS (TERMOS, PRIVACIDADE, REEMBOLSO E STAGING)
     ========================================================================== */
  let lastFocusedElement = null;

  function openModal(modalId, triggerEl) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    lastFocusedElement = triggerEl || document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    const closeBtn = modal.querySelector('[data-modal-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closeAllModals() {
    const openModals = document.querySelectorAll('.modal-backdrop:not([hidden])');
    openModals.forEach((modal) => {
      modal.hidden = true;
    });
    document.body.style.overflow = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function initModals() {
    document.querySelectorAll('[data-modal-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-modal-target');
        openModal(targetId, btn);
      });
    });

    document.querySelectorAll('[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', closeAllModals);
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeAllModals();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllModals();
    });
  }

  /* ==========================================================================
     8. FAQ ACCORDION TRACKING, INTERACTIVE CARDS & FOOTER YEAR
     ========================================================================== */
  function initInteractiveCards() {
    const cardSelector = [
      '.pain-card',
      '.positioning-banner',
      '.step-card',
      '.inside-card',
      '.use-case-card',
      '.comparison-card',
      '.included-item',
      '.audience-card',
      '.walkthrough-step'
    ].join(', ');

    const cards = document.querySelectorAll(cardSelector);
    const svgNS = 'http://www.w3.org/2000/svg';

    function syncCardLedGeometry(card) {
      const rect = card.querySelector('.card-led-bar');
      if (!rect) return;
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      if (w <= 2 || h <= 2) return;

      const computed = window.getComputedStyle(card);
      const radius = parseFloat(computed.borderTopLeftRadius) || 12;

      rect.setAttribute('x', '0.5');
      rect.setAttribute('y', '0.5');
      rect.setAttribute('width', String(w - 1));
      rect.setAttribute('height', String(h - 1));
      rect.setAttribute('rx', String(radius));
      rect.setAttribute('ry', String(radius));

      let perimeter = 2 * (w + h);
      if (typeof rect.getTotalLength === 'function') {
        try {
          const measured = rect.getTotalLength();
          if (measured > 0) perimeter = Math.ceil(measured);
        } catch (_) {
          // fallback matematico mantido
        }
      }
      rect.style.setProperty('--perimeter', `${perimeter}px`);
    }

    const resizeObserver =
      'ResizeObserver' in window
        ? new ResizeObserver((entries) => {
            entries.forEach((entry) => syncCardLedGeometry(entry.target));
          })
        : null;

    cards.forEach((card) => {
      if (!card.querySelector('.card-led-svg')) {
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('class', 'card-led-svg');
        svg.setAttribute('aria-hidden', 'true');

        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('class', 'card-led-bar');

        svg.appendChild(rect);
        card.appendChild(svg);
      }

      syncCardLedGeometry(card);
      if (resizeObserver) {
        resizeObserver.observe(card);
      }

      card.addEventListener('click', (e) => {
        const wasActive = card.classList.contains('is-card-active');
        cards.forEach((c) => c.classList.remove('is-card-active'));
        if (!wasActive) {
          card.classList.add('is-card-active');
        }
        e.stopPropagation();
      });
    });

    // Clicar fora de qualquer card desativa o card clicado anteriormente
    document.addEventListener('click', () => {
      cards.forEach((c) => c.classList.remove('is-card-active'));
    });
  }

  function initFAQAndFooter() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    document.querySelectorAll('.faq-item').forEach((item, index) => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          trackEvent('faq_open', { question_index: index + 1 }, { deduplicate: true });
        }
      });
    });
  }

  /* ==========================================================================
     9. FOGOS DE CONFETES + CARD "PROMOÇÃO LIBERADA" + CRONÔMETRO (< 10 MIN)
     ========================================================================== */
  function initPromoOfferExperience() {
    const offerSection = document.getElementById('oferta-final');
    const offerPricingCard = document.getElementById('offer-pricing-card');
    const promoModal = document.getElementById('promo-unlock-modal');
    const btnClosePromo = document.getElementById('btn-close-promo');
    const btnClaimPromo = document.getElementById('btn-claim-promo');
    const minEl = document.getElementById('promo-min');
    const secEl = document.getElementById('promo-sec');
    const inlineTimers = document.querySelectorAll('[data-promo-timer]');
    const canvas = document.getElementById('promo-confetti-canvas');

    if (!offerSection || !promoModal) return;

    // Cronômetro regressivo começando em 09:59 (599 segundos)
    let remainingSeconds = 9 * 60 + 59;
    let countdownInterval = null;
    let hasTriggeredUnlock = false;

    function renderTimer() {
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      const mStr = String(mins).padStart(2, '0');
      const sStr = String(secs).padStart(2, '0');

      if (minEl) minEl.textContent = mStr;
      if (secEl) secEl.textContent = sStr;
      inlineTimers.forEach((el) => {
        el.textContent = `${mStr}:${sStr}`;
      });
    }

    function startCountdown() {
      if (countdownInterval) return;
      renderTimer();
      countdownInterval = window.setInterval(() => {
        if (remainingSeconds > 0) {
          remainingSeconds -= 1;
          renderTimer();
        } else {
          // Mantém urgência reiniciando ciclo curto caso chegue a zero
          remainingSeconds = 2 * 60 + 59;
          renderTimer();
        }
      }, 1000);
    }

    // Inicia o cronômetro imediatamente para manter o card da oferta vivo
    startCountdown();

    // Motor leve de Fogos de Artifício + Confetes de Aniversário em Canvas 60fps
    const particles = [];
    let animFrameId = null;

    function resizeCanvas() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const COLORS = [
      '#E03A4D', // Red neon PromptOS
      '#C92F40', // Red brand
      '#22C55E', // Emerald promo
      '#FBBF24', // Gold party
      '#38BDF8', // Sky sparkle
      '#A855F7', // Vivid purple
      '#FFFFFF'  // Crisp white
    ];

    function spawnBurst(originX, originY, count, speedRange, spreadAngle, baseAngle) {
      for (let i = 0; i < count; i += 1) {
        const angle = baseAngle + (Math.random() - 0.5) * spreadAngle;
        const speed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
        const shapeRoll = Math.random();
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.19 + Math.random() * 0.08,
          drag: 0.982,
          size: 5 + Math.random() * 6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: shapeRoll < 0.62 ? 'rect' : shapeRoll < 0.85 ? 'circle' : 'spark',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.24,
          tilt: Math.random() * Math.PI,
          tiltSpeed: 0.08 + Math.random() * 0.14,
          alpha: 1,
          decay: 0.0075 + Math.random() * 0.007
        });
      }
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(stepConfetti);
      }
    }

    function stepConfetti() {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.tilt += p.tiltSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > h + 40) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const wobble = Math.cos(p.tilt);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, (-p.size * 0.55 * wobble) / 2, p.size, p.size * 0.6 * wobble);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.42, Math.max(1.2, Math.abs(p.size * 0.42 * wobble)), 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Faísca brilhante de fogo de artifício
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (particles.length > 0) {
        animFrameId = requestAnimationFrame(stepConfetti);
      } else {
        ctx.clearRect(0, 0, w, h);
        animFrameId = null;
      }
    }

    function fireCelebrationSequence() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 1ª Onda (0ms): Canhões laterais de festa disparando para o centro
      spawnBurst(w * 0.12, h * 0.78, 48, [7, 15], Math.PI * 0.42, -Math.PI * 0.34);
      spawnBurst(w * 0.88, h * 0.78, 48, [7, 15], Math.PI * 0.42, -Math.PI * 0.66);

      // 2ª Onda (240ms): Estouro de fogos central no alto da tela
      window.setTimeout(() => {
        spawnBurst(w * 0.5, h * 0.32, 65, [4, 12], Math.PI * 2, 0);
      }, 240);

      // 3ª Onda (520ms): Duplo estouro acompanhando a entrada do card "Promoção Liberada"
      window.setTimeout(() => {
        spawnBurst(w * 0.28, h * 0.38, 42, [3.5, 10], Math.PI * 2, 0);
        spawnBurst(w * 0.72, h * 0.38, 42, [3.5, 10], Math.PI * 2, 0);
      }, 520);
    }

    function openPromoModal() {
      promoModal.hidden = false;
      // Força reflow p/ transição suave
      void promoModal.offsetWidth;
      promoModal.classList.add('is-open');
      trackEvent('promo_unlock_view', { discount_pct: 76 }, { deduplicate: true });
    }

    function closePromoModal(claimed = false) {
      if (promoModal.hidden) return;
      promoModal.classList.remove('is-open');

      window.setTimeout(() => {
        promoModal.hidden = true;
      }, 320);

      if (offerPricingCard) {
        offerPricingCard.classList.remove('is-promo-claimed');
        void offerPricingCard.offsetWidth;
        offerPricingCard.classList.add('is-promo-claimed');

        if (claimed) {
          const w = window.innerWidth;
          const h = window.innerHeight;
          spawnBurst(w * 0.5, h * 0.52, 45, [4, 10], Math.PI * 2, 0);
          offerPricingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    if (btnClosePromo) {
      btnClosePromo.addEventListener('click', () => closePromoModal(false));
    }

    if (btnClaimPromo) {
      btnClaimPromo.addEventListener('click', () => {
        trackEvent('promo_unlock_claim', { discount_pct: 76 }, { deduplicate: true });
        closePromoModal(true);
      });
    }

    promoModal.addEventListener('click', (e) => {
      if (e.target === promoModal) {
        closePromoModal(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !promoModal.hidden) {
        closePromoModal(false);
      }
    });

    // Dispara automaticamente quando o usuário rola a página e chega na Seção 10
    if ('IntersectionObserver' in window) {
      const offerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasTriggeredUnlock) {
              hasTriggeredUnlock = true;
              offerObserver.disconnect();

              // 1. Estoura os fogos de aniversário com confetes
              fireCelebrationSequence();

              // 2. Surge o card "Promoção Liberada" suavemente logo após o estouro inicial
              window.setTimeout(() => {
                openPromoModal();
              }, 440);
            }
          });
        },
        { threshold: 0.28 }
      );
      offerObserver.observe(offerSection);
    }
  }

  /* ==========================================================================
     10. EFEITO DE SURGIMENTO UNIFORME AO ROLAR PARA BAIXO (SCROLL REVEAL ONE-WAY)
     Surge suavemente à medida que o usuário desce a página. Ao subir de volta,
     tudo o que já foi visto permanece 100% visível sem repetir a animação.
     ========================================================================== */
  function initScrollReveal() {
    const revealSelectors = [
      '.hero__copy-main',
      '.hero__mascot-stage',
      '.hero__cta-block',
      '.hero__visual',
      '.section-header',
      '.audience-header-row',
      '.pain-card',
      '.positioning-banner',
      '.step-card',
      '.section-cta',
      '.inside-card',
      '.use-case-card',
      '.use-cases-closing',
      '.scenario-switcher',
      '.comparison-card',
      '.included-item',
      '.audience-card',
      '.walkthrough-step',
      '.offer-box',
      '.faq-item',
      '.site-footer__brand',
      '.site-footer__links',
      '.site-footer__support',
      '.site-footer__bottom'
    ].join(', ');

    const elements = Array.from(document.querySelectorAll(revealSelectors));
    if (elements.length === 0) return;

    // Aplica um atraso progressivo (stagger) uniforme para cards irmãos na mesma grade
    const gridContainers = document.querySelectorAll(
      '.pain-grid, .steps-grid, .inside-showcase, .use-cases-grid, .comparison-grid, .included-grid, .audience-grid, .walkthrough-timeline, .faq-list, .site-footer__grid'
    );

    gridContainers.forEach((grid) => {
      const visibleChildren = Array.from(grid.children).filter((child) => {
        return window.getComputedStyle(child).display !== 'none';
      });
      visibleChildren.forEach((child, idx) => {
        // Stagger curto e fluido (máx 240ms) para manter sensação rápida e uniforme
        const delayMs = Math.min(idx % 4, 3) * 75;
        child.style.setProperty('--reveal-delay', `${delayMs}ms`);
      });
    });

    // Stagger suave nos blocos do Hero inicial
    const heroSequence = [
      document.querySelector('.hero__copy-main'),
      document.querySelector('.hero__mascot-stage'),
      document.querySelector('.hero__cta-block'),
      document.querySelector('.hero__visual')
    ].filter(Boolean);

    heroSequence.forEach((el, idx) => {
      el.style.setProperty('--reveal-delay', `${idx * 85}ms`);
    });

    function markRevealed(el, instant = false) {
      if (instant) {
        el.style.setProperty('--reveal-delay', '0ms');
        el.classList.add('is-revealed', 'is-reveal-done');
        return;
      }

      el.classList.add('is-revealed');
      const delayVal = parseInt(el.style.getPropertyValue('--reveal-delay') || '0', 10) || 0;
      window.setTimeout(() => {
        el.classList.add('is-reveal-done');
      }, 720 + delayVal);
    }

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => markRevealed(el, true));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markRevealed(entry.target, false);
            // Desacopla imediatamente para nunca mais esconder ao rolar para cima
            revealObserver.unobserve(entry.target);
          } else if (entry.boundingClientRect.top < 0) {
            // Caso o usuário tenha dado um salto rápido para baixo passando direto pelo item,
            // já deixa revelado para que ao subir esteja 100% visível
            markRevealed(entry.target, true);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -32px 0px'
      }
    );

    const viewportH = window.innerHeight || document.documentElement.clientHeight;

    elements.forEach((el) => {
      el.classList.add('scroll-reveal');
      const rect = el.getBoundingClientRect();

      if (rect.bottom <= 0) {
        // Já ficou acima da tela (ex: reload no meio da página) -> permanece visível sem animar
        markRevealed(el, true);
      } else if (rect.top < viewportH * 0.9) {
        // Já está visível na dobra inicial -> anima suavemente na entrada
        requestAnimationFrame(() => {
          markRevealed(el, false);
        });
      } else {
        // Está abaixo da tela -> aguarda o usuário rolar para baixo
        revealObserver.observe(el);
      }
    });
  }

  /* ==========================================================================
     BOOT
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initVariants();
    initInteractiveDemos();
    initCheckoutCTAs();
    initStickyMobileCTA();
    initModals();
    initInteractiveCards();
    initFAQAndFooter();
    initPromoOfferExperience();
    initScrollReveal();

    trackEvent('lp_view', { page: 'promptos_essencial' }, { deduplicate: true });
  });
})();
