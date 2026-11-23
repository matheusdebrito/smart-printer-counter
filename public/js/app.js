/**
 * Dashboard Principal - Smart Printer Counter
 */
document.addEventListener('DOMContentLoaded', () => {
  // Estado da aplicação
  const state = {
    printers: [],
    collecting: new Set(),
    checkingAccessibility: new Set()
  };

  // Elementos DOM
  const elements = {
    printersGrid: document.getElementById('printers-grid'),
    btnCheckAll: document.getElementById('btn-check-all'),
    btnCollectAll: document.getElementById('btn-collect-all'),
    totalPrinters: document.getElementById('total-printers'),
    accessibleCount: document.getElementById('accessible-count'),
    inaccessibleCount: document.getElementById('inaccessible-count'),
    lastCheck: document.getElementById('last-check'),
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalFooter: document.getElementById('modal-footer'),
    modalClose: document.getElementById('modal-close'),
    toastContainer: document.getElementById('toast-container')
  };

  // SVG Icons
  const ICONS = {
    printer: `<svg class="icon icon-lg" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="14" rx="2"/><rect x="6" y="16" width="12" height="6" rx="1"/><line x1="6" y1="8" x2="18" y2="8"/></svg>`,
    users: `<svg class="icon icon-lg" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    money: `<svg class="icon icon-lg" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    document: `<svg class="icon icon-lg" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    heart: `<svg class="icon icon-lg" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    package: `<svg class="icon icon-lg" viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    coffee: `<svg class="icon icon-lg" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
    building: `<svg class="icon icon-lg" viewBox="0 0 24 24"><rect x="3" y="21" width="18" height="1" rx="1"/><path d="M5 21V7l9-5 9 5v14"/><path d="M9 21v-8"/><path d="M15 21v-8"/></svg>`,
    eco: `<svg class="icon icon-lg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>`,
    vip: `<svg class="icon icon-lg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    info: `<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    check: `<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
    refresh: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    download: `<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    spinner: `<svg class="icon icon-md spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 100" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></svg>`,
    empty: `<svg class="icon icon-lg" viewBox="0 0 24 24" style="opacity: 0.3"><rect x="2" y="2" width="20" height="14" rx="2"/><rect x="6" y="16" width="12" height="6" rx="1"/><line x1="6" y1="8" x2="18" y2="8"/></svg>`
  };

  function getPrinterIcon(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('rh') || lowerName.includes('recursos')) return ICONS.users;
    if (lowerName.includes('faturamento') || lowerName.includes('financeiro')) return ICONS.money;
    if (lowerName.includes('laudo') || lowerName.includes('exame')) return ICONS.document;
    if (lowerName.includes('ergometrico') || lowerName.includes('teste')) return ICONS.heart;
    if (lowerName.includes('envelopamento') || lowerName.includes('envelope')) return ICONS.package;
    if (lowerName.includes('copa') || lowerName.includes('cozinha')) return ICONS.coffee;
    if (lowerName.includes('recepcao') || lowerName.includes('recepc')) return ICONS.building;
    if (lowerName.includes('barra') || lowerName.includes('prev')) return ICONS.printer;
    if (lowerName.includes('ultra') || lowerName.includes('eco')) return ICONS.eco;
    if (lowerName.includes('vip') || lowerName.includes('sala')) return ICONS.vip;
    return ICONS.printer;
  }

  function getStatusText(status) {
    if (status === true) return 'Online';
    if (status === false) return 'Offline';
    if (status === null) return 'Verificando...';
    return 'Desconhecido';
  }

  function getBadgeClass(status) {
    if (status === true) return 'online';
    if (status === false) return 'offline';
    if (status === null) return 'checking';
    return 'unknown';
  }

  function getDotClass(status) {
    if (status === true) return 'online';
    if (status === false) return 'offline';
    if (status === null) return 'checking';
    return 'unknown';
  }

  // Inicialização
  async function init() {
    await loadPrinters(true);
    setupEventListeners();
    setInterval(() => loadPrinters(true), 2 * 60 * 1000);
  }

  function setupEventListeners() {
    elements.btnCheckAll.addEventListener('click', checkAllAccessibility);
    elements.btnCollectAll.addEventListener('click', collectAllCounters);
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === elements.modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  async function loadPrinters(checkAccessibility = false) {
    try {
      showLoading(true);
      const data = await api.getPrinters(checkAccessibility);
      state.printers = data.printers || [];
      renderPrintersGrid();
      updateStatusBar();
      updateLastCheckTime();
    } catch (error) {
      showToast('Erro ao carregar impressoras: ' + error.message, 'error');
      console.error(error);
    } finally {
      showLoading(false);
    }
  }

  function renderPrintersGrid() {
    const { printersGrid } = elements;
    
    if (state.printers.length === 0) {
      printersGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${ICONS.empty}</div>
          <p class="empty-state-title">Nenhuma impressora configurada</p>
          <p class="empty-state-message">Adicione impressoras no arquivo de configuração</p>
        </div>
      `;
      return;
    }

    printersGrid.innerHTML = state.printers.map(printer => createPrinterCard(printer)).join('');
    
    state.printers.forEach(printer => {
      const card = document.getElementById(`card-${printer.id}`);
      if (!card) return;
      
      const btnCollect = card.querySelector('.btn-collect');
      const btnCheck = card.querySelector('.btn-check');
      const btnDetails = card.querySelector('.btn-details');
      
      if (btnCollect) btnCollect.addEventListener('click', () => collectSingleCounter(printer.id));
      if (btnCheck) btnCheck.addEventListener('click', () => checkSingleAccessibility(printer.id));
      if (btnDetails) btnDetails.addEventListener('click', () => showPrinterDetails(printer));
    });
  }

  function createPrinterCard(printer) {
    const accessible = printer.accessibility?.accessible;
    const statusClass = accessible === true ? 'accessible' : accessible === false ? 'inaccessible' : accessible === null ? 'checking' : '';
    const badgeClass = getBadgeClass(accessible);
    const badgeText = getStatusText(accessible);
    const badgeDotClass = getDotClass(accessible);
    const isCollecting = state.collecting.has(printer.id);
    const isChecking = state.checkingAccessibility.has(printer.id);
    const printerIcon = getPrinterIcon(printer.name);
    
    return `
      <article class="printer-card ${statusClass}" id="card-${printer.id}">
        <div class="printer-card-header">
          <div class="printer-card-main">
            <div class="printer-icon">${printerIcon}</div>
            <div class="printer-info">
              <span class="printer-name">${escapeHtml(printer.name)}</span>
              <div class="printer-meta">
                <span class="printer-ip">${escapeHtml(printer.ip)}</span>
                <span class="printer-type">${printer.type?.toUpperCase() || 'PDF'}</span>
              </div>
            </div>
          </div>
          <span class="accessibility-badge ${badgeClass}" id="badge-${printer.id}">
            <span class="dot ${badgeDotClass}"></span>
            ${badgeText}
          </span>
        </div>
        
        <div class="printer-card-details" id="details-${printer.id}">
          ${!isCollecting && !isChecking ? `
            <div class="detail-item">
              <span class="detail-label">Tipo</span>
              <span class="detail-value">${printer.type?.toUpperCase() || 'PDF'}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="printer-card-status" id="status-${printer.id}">
          ${isCollecting ? ICONS.spinner + '<span>Coletando contador...</span>' : ''}
          ${isChecking ? ICONS.spinner + '<span>Verificando acessibilidade...</span>' : ''}
        </div>
        
        <div class="printer-card-result" id="result-${printer.id}"></div>
        
        <div class="printer-card-actions">
          <button class="btn btn-primary btn-collect ${isCollecting ? 'disabled' : ''}" 
                  id="collect-${printer.id}" 
                  ${isCollecting ? 'disabled' : ''}
                  title="Coletar contador desta impressora">
            ${ICONS.download} Coletar
          </button>
          <button class="btn btn-secondary btn-check ${isChecking ? 'disabled' : ''}"
                  id="check-${printer.id}"
                  ${isChecking ? 'disabled' : ''}
                  title="Verificar se impressora está acessível">
            ${ICONS.refresh} Verificar
          </button>
          <button class="btn btn-ghost btn-details btn-sm" 
                  id="details-btn-${printer.id}"
                  title="Ver detalhes">
            ${ICONS.info} Detalhes
          </button>
        </div>
      </article>
    `;
  }

  function updateStatusBar() {
    const total = state.printers.length;
    const accessible = state.printers.filter(p => p.accessibility?.accessible === true).length;
    const inaccessible = state.printers.filter(p => p.accessibility?.accessible === false).length;
    
    elements.totalPrinters.textContent = total;
    elements.accessibleCount.textContent = accessible;
    elements.inaccessibleCount.textContent = inaccessible;
    
    const accessibleDot = document.querySelector('.status-dot.online');
    const inaccessibleDot = document.querySelector('.status-dot.offline');
    if (accessibleDot) accessibleDot.style.background = accessible > 0 ? 'var(--success)' : 'var(--border)';
    if (inaccessibleDot) inaccessibleDot.style.background = inaccessible > 0 ? 'var(--danger)' : 'var(--border)';
  }

  function updateLastCheckTime() {
    const now = new Date();
    elements.lastCheck.textContent = `Última verificação: ${now.toLocaleTimeString('pt-BR')}`;
  }

  async function checkAllAccessibility() {
    elements.btnCheckAll.disabled = true;
    elements.btnCheckAll.innerHTML = `${ICONS.spinner} Verificando...`;
    
    try {
      const data = await api.checkAllPrintersAccessibility(true);
      state.printers = data.results || [];
      renderPrintersGrid();
      updateStatusBar();
      updateLastCheckTime();
      showToast('Verificação de acessibilidade concluída', 'success');
    } catch (error) {
      showToast('Erro ao verificar acessibilidade: ' + error.message, 'error');
    } finally {
      elements.btnCheckAll.disabled = false;
      elements.btnCheckAll.innerHTML = `${ICONS.refresh} Reverificar Todas`;
    }
  }

  async function checkSingleAccessibility(printerId) {
    state.checkingAccessibility.add(printerId);
    updatePrinterCardStatus(printerId);
    
    try {
      const data = await api.checkPrinterAccessibility(printerId, true);
      const idx = state.printers.findIndex(p => p.id === printerId);
      if (idx >= 0) {
        state.printers[idx].accessibility = data;
      }
      renderPrintersGrid();
      updateStatusBar();
      updateLastCheckTime();
      showToast(`Verificação de ${data.printerName} concluída`, data.accessible ? 'success' : 'warning');
    } catch (error) {
      showToast('Erro ao verificar: ' + error.message, 'error');
    } finally {
      state.checkingAccessibility.delete(printerId);
      updatePrinterCardStatus(printerId);
    }
  }

  async function collectSingleCounter(printerId) {
    state.collecting.add(printerId);
    updatePrinterCardStatus(printerId);
    
    try {
      const data = await api.collectSingleCounter(printerId);
      const result = data.result;
      
      showPrinterResult(printerId, result);
      
      if (result.success) {
        showToast(`${result.printerName}: Contador coletado com sucesso`, 'success');
      } else {
        showToast(`${result.printerName}: ${result.error}`, 'error');
      }
    } catch (error) {
      showToast('Erro na coleta: ' + error.message, 'error');
      showPrinterResult(printerId, { success: false, error: error.message });
    } finally {
      state.collecting.delete(printerId);
      updatePrinterCardStatus(printerId);
    }
  }

  async function collectAllCounters() {
    elements.btnCollectAll.disabled = true;
    elements.btnCollectAll.innerHTML = `${ICONS.spinner} Coletando...`;
    
    state.printers.forEach(p => state.collecting.add(p.id));
    renderPrintersGrid();
    
    try {
      const data = await api.collectCounters();
      const { results, summary } = data;
      
      results.forEach(result => showPrinterResult(result.printerId, result));
      
      const msg = `Coleta finalizada: ${summary.success} sucesso, ${summary.error} erro (${summary.durationMs}ms)`;
      showToast(msg, summary.error > 0 ? 'warning' : 'success');
      
    } catch (error) {
      showToast('Erro na coleta em lote: ' + error.message, 'error');
    } finally {
      elements.btnCollectAll.disabled = false;
      elements.btnCollectAll.innerHTML = `${ICONS.download} Coletar Todas`;
      state.printers.forEach(p => state.collecting.delete(p.id));
      renderPrintersGrid();
    }
  }

  function showPrinterResult(printerId, result) {
    const resultEl = document.getElementById(`result-${printerId}`);
    if (!resultEl) return;
    
    const printer = state.printers.find(p => p.id === printerId);
    const printerName = printer?.name || printerId;
    
    if (result.success) {
      const fileName = result.filePath ? result.filePath.split('/').pop().split('\\').pop() : 'arquivo';
      resultEl.className = 'printer-card-result visible success';
      resultEl.innerHTML = `
        <span class="result-icon">${ICONS.check}</span>
        <div class="result-content">
          <span class="result-title">Sucesso</span>
          <div class="result-meta">
            <code>${escapeHtml(fileName)}</code>
            <span>${result.fileType?.toUpperCase() || 'N/A'}</span>
            <span>${formatFileSize(result.fileSize)}</span>
            <span>${new Date(result.collectedAt).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      `;
    } else {
      resultEl.className = 'printer-card-result visible error';
      resultEl.innerHTML = `
        <span class="result-icon">${ICONS.refresh}</span>
        <div class="result-content">
          <span class="result-title">Erro</span>
          <div class="result-meta">
            <span>${escapeHtml(result.error || 'Erro desconhecido')}</span>
          </div>
        </div>
        <button class="btn btn-sm btn-primary retry-btn" onclick="collectSingleCounter('${printerId}')">
          ${ICONS.refresh} Tentar Novamente
        </button>
      `;
    }
  }

  function updatePrinterCardStatus(printerId) {
    const statusEl = document.getElementById(`status-${printerId}`);
    const badgeEl = document.getElementById(`badge-${printerId}`);
    const collectBtn = document.getElementById(`collect-${printerId}`);
    const checkBtn = document.getElementById(`check-${printerId}`);
    
    const isCollecting = state.collecting.has(printerId);
    const isChecking = state.checkingAccessibility.has(printerId);
    
    if (statusEl) {
      if (isCollecting) {
        statusEl.innerHTML = ICONS.spinner + '<span>Coletando contador...</span>';
      } else if (isChecking) {
        statusEl.innerHTML = ICONS.spinner + '<span>Verificando acessibilidade...</span>';
      } else {
        statusEl.innerHTML = '';
      }
    }
    
    if (collectBtn) {
      collectBtn.disabled = isCollecting;
      collectBtn.classList.toggle('disabled', isCollecting);
      collectBtn.innerHTML = isCollecting ? `${ICONS.spinner} Coletando...` : `${ICONS.download} Coletar`;
    }
    
    if (checkBtn) {
      checkBtn.disabled = isChecking;
      checkBtn.classList.toggle('disabled', isChecking);
      checkBtn.innerHTML = isChecking ? `${ICONS.spinner} Verificando...` : `${ICONS.refresh} Verificar`;
    }
  }

  function showPrinterDetails(printer) {
    elements.modalTitle.textContent = printer.name;
    
    const accessibility = printer.accessibility;
    const accText = accessibility?.accessible === true ? 'Online' 
      : accessibility?.accessible === false ? 'Offline' 
      : accessibility?.accessible === null ? 'Verificando...' 
      : 'Não verificado';
    
    elements.modalBody.innerHTML = `
      <div class="modal-detail-row">
        <span class="modal-detail-label">ID</span>
        <span class="modal-detail-value"><code>${escapeHtml(printer.id)}</code></span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">Nome</span>
        <span class="modal-detail-value">${escapeHtml(printer.name)}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">IP</span>
        <span class="modal-detail-value"><code>${escapeHtml(printer.ip)}</code></span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">Tipo de Arquivo</span>
        <span class="modal-detail-value">${printer.type?.toUpperCase() || 'N/A'}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">URL de Verificação</span>
        <span class="modal-detail-value"><code>${escapeHtml(printer.checkUrl)}</code></span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">Acessibilidade</span>
        <span class="modal-detail-value">${accText}</span>
      </div>
      ${accessibility?.checkedAt ? `
      <div class="modal-detail-row">
        <span class="modal-detail-label">Última Verificação</span>
        <span class="modal-detail-value">${new Date(accessibility.checkedAt).toLocaleString('pt-BR')}</span>
      </div>
` : ''}
    `;
    
    elements.modalFooter.innerHTML = `
      <button class="btn btn-secondary" onclick="checkSingleAccessibility('${printer.id}'); closeModal();">
        ${ICONS.refresh} Verificar Acessibilidade
      </button>
      <button class="btn btn-primary" onclick="collectSingleCounter('${printer.id}'); closeModal();">
        ${ICONS.download} Coletar Contador
      </button>
    `;
    
    openModal();
  }

  function openModal() {
    elements.modalOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    elements.modalOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: ICONS.check,
      error: ICONS.refresh,
      warning: ICONS.refresh,
      info: ICONS.info
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">
        <span class="toast-message">${escapeHtml(message)}</span>
      </div>
      <button class="toast-close" aria-label="Fechar">&times;</button>
    `;
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    });
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  }

  function showLoading(show) {
    let overlay = document.querySelector('.loading-overlay');
    if (show) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
          <div class="loading-spinner"></div>
          <span class="loading-text">Carregando...</span>
        `;
        document.body.appendChild(overlay);
      }
    } else if (overlay) {
      overlay.remove();
    }
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }

  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  window.collectSingleCounter = collectSingleCounter;
  window.checkSingleAccessibility = checkSingleAccessibility;

  init();
});