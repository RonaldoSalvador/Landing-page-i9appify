/**
 * i9 Appify - Widget de Captura de Leads
 *
 * USO: Adicione no site do cliente:
 * <script src="https://SEU_DOMINIO/widget.js" data-widget-id="ID_DO_WIDGET"></script>
 *
 * O widget abre automaticamente após X segundos, exibe uma saudação,
 * coleta nome/telefone/email e envia para o CRM da i9 Appify.
 */
(function() {
  'use strict';

  // Configurações padrão
  const SUPABASE_URL = 'https://ldqjunoqeepcdctheidd.supabase.co';
  const WIDGET_CAPTURE_URL = SUPABASE_URL + '/functions/v1/widget-capture';

  // Pegar configs do script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-widget-id]');
  const widgetId = scriptTag?.getAttribute('data-widget-id') || '';
  const themeColor = scriptTag?.getAttribute('data-color') || '#1F2A44';
  const accentColor = scriptTag?.getAttribute('data-accent') || '#FF6600';
  const position = scriptTag?.getAttribute('data-position') || 'bottom-right';
  const greeting = scriptTag?.getAttribute('data-greeting') || 'Olá! 👋 Como posso te ajudar?';
  const autoOpenDelay = parseInt(scriptTag?.getAttribute('data-auto-open') || '5') * 1000;

  // Estado
  let isOpen = false;
  let step = 'greeting'; // greeting, form, success
  let leadData = { nome: '', telefone: '', email: '', mensagem: '' };

  // Criar CSS
  const style = document.createElement('style');
  style.textContent = `
    #i9-widget-container * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #i9-widget-btn {
      position: fixed; ${position === 'bottom-left' ? 'left: 24px' : 'right: 24px'}; bottom: 24px;
      width: 60px; height: 60px; border-radius: 50%; background: ${themeColor};
      border: none; cursor: pointer; box-shadow: 0 4px 24px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      z-index: 99999; transition: transform 0.3s, box-shadow 0.3s;
    }
    #i9-widget-btn:hover { transform: scale(1.1); box-shadow: 0 6px 32px rgba(0,0,0,0.3); }
    #i9-widget-btn svg { width: 28px; height: 28px; fill: white; }
    #i9-widget-btn .close-icon { display: none; }
    #i9-widget-btn.open .chat-icon { display: none; }
    #i9-widget-btn.open .close-icon { display: block; }

    #i9-widget-panel {
      position: fixed; ${position === 'bottom-left' ? 'left: 24px' : 'right: 24px'}; bottom: 100px;
      width: 380px; max-height: 520px; background: white; border-radius: 16px;
      box-shadow: 0 8px 48px rgba(0,0,0,0.15); z-index: 99998;
      overflow: hidden; display: none; flex-direction: column;
      animation: i9SlideUp 0.3s ease-out;
    }
    #i9-widget-panel.open { display: flex; }
    @keyframes i9SlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .i9w-header {
      background: ${themeColor}; color: white; padding: 20px;
      display: flex; align-items: center; gap: 12px;
    }
    .i9w-avatar { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .i9w-header h3 { font-size: 16px; font-weight: 600; }
    .i9w-header p { font-size: 12px; opacity: 0.8; }
    .i9w-online { display: inline-block; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; margin-right: 4px; }

    .i9w-body { padding: 20px; flex: 1; overflow-y: auto; }
    .i9w-message { background: #f3f4f6; border-radius: 12px 12px 12px 0; padding: 12px 16px; font-size: 14px; color: #333; margin-bottom: 16px; line-height: 1.5; }

    .i9w-form { display: flex; flex-direction: column; gap: 10px; }
    .i9w-input {
      width: 100%; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px;
      font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    .i9w-input:focus { border-color: ${accentColor}; }
    .i9w-input::placeholder { color: #9ca3af; }

    .i9w-btn {
      width: 100%; padding: 12px; border: none; border-radius: 10px;
      background: ${accentColor}; color: white; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s;
    }
    .i9w-btn:hover { opacity: 0.9; }
    .i9w-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .i9w-success { text-align: center; padding: 24px 0; }
    .i9w-success-icon { font-size: 48px; margin-bottom: 12px; }
    .i9w-success h4 { font-size: 18px; color: #111; margin-bottom: 8px; }
    .i9w-success p { font-size: 13px; color: #666; }

    .i9w-powered { text-align: center; padding: 8px; font-size: 10px; color: #aaa; border-top: 1px solid #f0f0f0; }
    .i9w-powered a { color: ${themeColor}; text-decoration: none; font-weight: 600; }

    @media (max-width: 440px) {
      #i9-widget-panel { width: calc(100vw - 24px); ${position === 'bottom-left' ? 'left: 12px' : 'right: 12px'}; }
    }

    .i9w-notification {
      position: fixed; ${position === 'bottom-left' ? 'left: 96px' : 'right: 96px'}; bottom: 36px;
      background: white; border-radius: 12px; padding: 12px 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12); z-index: 99997;
      max-width: 260px; font-size: 14px; color: #333; display: none;
      animation: i9SlideUp 0.3s ease-out;
    }
    .i9w-notification.show { display: block; }
    .i9w-notification-close { position: absolute; top: 4px; right: 8px; background: none; border: none; cursor: pointer; color: #999; font-size: 16px; }
  `;
  document.head.appendChild(style);

  // Criar container
  const container = document.createElement('div');
  container.id = 'i9-widget-container';
  container.innerHTML = `
    <!-- Notification Bubble -->
    <div class="i9w-notification" id="i9-notification">
      <button class="i9w-notification-close" onclick="document.getElementById('i9-notification').classList.remove('show')">&times;</button>
      ${greeting}
    </div>

    <!-- Toggle Button -->
    <button id="i9-widget-btn" aria-label="Chat">
      <svg class="chat-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      <svg class="close-icon" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
    </button>

    <!-- Chat Panel -->
    <div id="i9-widget-panel">
      <div class="i9w-header">
        <div class="i9w-avatar">🤖</div>
        <div>
          <h3>i9 Appify</h3>
          <p><span class="i9w-online"></span>Online agora</p>
        </div>
      </div>
      <div class="i9w-body" id="i9-widget-body"></div>
      <div class="i9w-powered">Powered by <a href="https://i9appify.com.br" target="_blank">i9 Appify</a></div>
    </div>
  `;
  document.body.appendChild(container);

  // Renderizar conteúdo do body
  function renderBody() {
    const body = document.getElementById('i9-widget-body');

    if (step === 'greeting') {
      body.innerHTML = `
        <div class="i9w-message">${greeting}</div>
        <div class="i9w-form">
          <input class="i9w-input" id="i9-nome" placeholder="Seu nome" value="${leadData.nome}" />
          <input class="i9w-input" id="i9-telefone" placeholder="WhatsApp (ex: 11999999999)" value="${leadData.telefone}" />
          <input class="i9w-input" id="i9-email" placeholder="E-mail (opcional)" value="${leadData.email}" />
          <textarea class="i9w-input" id="i9-mensagem" placeholder="Como posso te ajudar?" rows="2" style="resize:none">${leadData.mensagem}</textarea>
          <button class="i9w-btn" id="i9-send-btn">Enviar mensagem</button>
        </div>
      `;

      // Bind events
      document.getElementById('i9-nome').addEventListener('input', e => leadData.nome = e.target.value);
      document.getElementById('i9-telefone').addEventListener('input', e => leadData.telefone = e.target.value);
      document.getElementById('i9-email').addEventListener('input', e => leadData.email = e.target.value);
      document.getElementById('i9-mensagem').addEventListener('input', e => leadData.mensagem = e.target.value);
      document.getElementById('i9-send-btn').addEventListener('click', submitLead);

    } else if (step === 'sending') {
      body.innerHTML = `<div style="text-align:center;padding:40px 0;"><div style="font-size:32px;animation:spin 1s linear infinite;">⏳</div><p style="margin-top:12px;color:#666">Enviando...</p></div>`;

    } else if (step === 'success') {
      body.innerHTML = `
        <div class="i9w-success">
          <div class="i9w-success-icon">✅</div>
          <h4>Mensagem enviada!</h4>
          <p>Recebemos seu contato. Nossa equipe entrará em contato pelo WhatsApp em breve.</p>
        </div>
      `;
    }
  }

  async function submitLead() {
    if (!leadData.nome && !leadData.telefone && !leadData.email) {
      alert('Preencha pelo menos seu nome e telefone.');
      return;
    }

    step = 'sending';
    renderBody();

    try {
      await fetch(WIDGET_CAPTURE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Widget-Id': widgetId },
        body: JSON.stringify({
          widgetId: widgetId ? parseInt(widgetId) : null,
          nome: leadData.nome,
          telefone: leadData.telefone,
          email: leadData.email,
          mensagem: leadData.mensagem,
          pageUrl: window.location.href,
          pageTitle: document.title,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        }),
      });
      step = 'success';
    } catch (e) {
      console.error('[i9-widget] Erro:', e);
      step = 'success'; // Mostra sucesso mesmo se falhar (melhor UX)
    }

    renderBody();
  }

  // Toggle panel
  const btn = document.getElementById('i9-widget-btn');
  const panel = document.getElementById('i9-widget-panel');
  const notification = document.getElementById('i9-notification');

  btn.addEventListener('click', () => {
    isOpen = !isOpen;
    btn.classList.toggle('open', isOpen);
    panel.classList.toggle('open', isOpen);
    notification.classList.remove('show');

    if (isOpen && step === 'greeting') {
      renderBody();
    }
  });

  // Auto-open notification after delay
  setTimeout(() => {
    if (!isOpen) {
      notification.classList.add('show');
      // Auto-hide after 10s
      setTimeout(() => notification.classList.remove('show'), 10000);
    }
  }, autoOpenDelay);

})();
