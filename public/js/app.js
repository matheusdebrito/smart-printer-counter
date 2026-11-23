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

  // Inicialização
  async function init() {
    await loadPrinters(true); // Carrega com verificação de acessibilidade
    setupEventListeners();
    // Atualiza acessibilidade periodicamente (a cada 2 minutos)
    setInterval(() => loadPrinters(true), 2 * 60 * 1000);
  }

  // Event Listeners
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

  // Carrega lista de impressoras
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

  // Renderiza grid de impressoras
  function renderPrintersGrid() {
    const { printersGrid } = elements;
    
    if (state.printers.length === 0) {
      printersGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🖨️</div>
          <p>Nenhuma impressora configurada</p>
        </div>
      `;
      return;
    }

    printersGrid.innerHTML = state.printers.map(printer => createPrinterCard(printer)).join('');
    
    // Adiciona event listeners aos botões
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

  // Cria HTML do card da impressora
  function createPrinterCard(printer) {
    const accessible = printer.accessibility?.accessible;
    const statusClass = accessible === true ? 'accessible' : accessible === false ? 'inaccessible' : accessible === null ? 'checking' : '';
    const badgeClass = accessible === true ? 'online' : accessible === false ? 'offline' : accessible === null ? 'checking' : 'unknown';
    const badgeText = accessible === true ? 'Online' : accessible === false ? 'Offline' : accessible === null ? 'Verificando...' : 'Desconhecido';
    const badgeDotClass = accessible === true ? 'online' : accessible === false ? 'offline' : accessible === null ? 'checking' : 'unknown';
    const isCollecting = state.collecting.has(printer.id);
    const isChecking = state.checkingAccessibility.has(printer.id);
    
    // Determine printer icon based on name/type
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
          ${isCollecting ? '<div class="spinner"></div><span>Coletando contador...</span>' : ''}
          ${isChecking ? '<div class="spinner"></div><span>Verificando acessibilidade...</span>' : ''}
        </div>
        
        <div class="printer-card-result" id="result-${printer.id}"></div>
        
        <div class="printer-card-actions">
          <button class="btn btn-primary btn-collect ${isCollecting ? 'disabled' : ''}" 
                  id="collect-${printer.id}" 
                  ${isCollecting ? 'disabled' : ''}
                  title="Coletar contador desta impressora">
            📊 Coletar
          </button>
          <button class="btn btn-secondary btn-check ${isChecking ? 'disabled' : ''}"
                  id="check-${printer.id}"
                  ${isChecking ? 'disabled' : ''}
                  title="Verificar se impressora está acessível">
            🔄 Verificar
          </button>
          <button class="btn btn-ghost btn-details btn-sm" 
                  id="details-btn-${printer.id}"
                  title="Ver detalhes">
            ℹ️ Detalhes
          </button>
        </div>
      </article>
    `;
  }

  function getPrinterIcon(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('rh') || lowerName.includes('recursos')) return '👥';
    if (lowerName.includes('faturamento') || lowerName.includes('financeiro')) return '💰';
    if (lowerName.includes('laudo') || lowerName.includes('exame')) return '📋';
    if (lowerName.includes('ergometrico') || lowerName.includes('teste')) return '❤️';
    if (lowerName.includes('envelopamento') || lowerName.includes('envelope')) return '📦';
    if (lowerName.includes('copa') || lowerName.includes('cozinha')) return '☕';
    if (lowerName.includes('recepcao') || lowerName.includes('recepc')) return '🏢';
    if (lowerName.includes('barra') || lowerName.includes('prev')) return '🖨️';
    if (lowerName.includes('ultra') || lowerName.includes('eco')) return '🌿';
    if (lowerName.includes('vip') || lowerName.includes('sala')) return '👑';
    return '🖨️';
  }

  // Atualiza barra de status
  function updateStatusBar() {
    const total = state.printers.length;
    const accessible = state.printers.filter(p => p.accessibility?.accessible === true).length;
    const inaccessible = state.printers.filter(p => p.accessibility?.accessible === false).length;
    
    elements.totalPrinters.textContent = total;
    elements.accessibleCount.textContent = accessible;
    elements.inaccessibleCount.textContent = inaccessible;
  }

  // Atualiza horário da última verificação
  function updateLastCheckTime() {
    const now = new Date();
    elements.lastCheck.textContent = `Última verificação: ${now.toLocaleTimeString('pt-BR')}`;
  }

  // Verifica acessibilidade de todas
  async function checkAllAccessibility() {
    elements.btnCheckAll.disabled = true;
    elements.btnCheckAll.textContent = '⏳ Verificando...';
    
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
      elements.btnCheckAll.textContent = '🔄 Reverificar Todas';
    }
  }

  // Verifica acessibilidade de uma impressora
  async function checkSingleAccessibility(printerId) {
    state.checkingAccessibility.add(printerId);
    updatePrinterCardStatus(printerId);
    
    try {
      const data = await api.checkPrinterAccessibility(printerId, true);
      // Atualiza no estado
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

  // Coleta contador de uma impressora
  async function collectSingleCounter(printerId) {
    state.collecting.add(printerId);
    updatePrinterCardStatus(printerId);
    
    try {
      const data = await api.collectSingleCounter(printerId);
      const result = data.result;
      
      // Mostra resultado no card
      showPrinterResult(printerId, result);
      
      if (result.success) {
        showToast(`✅ ${result.printerName}: Contador coletado com sucesso`, 'success');
      } else {
        showToast(`❌ ${result.printerName}: ${result.error}`, 'error');
      }
    } catch (error) {
      showToast('Erro na coleta: ' + error.message, 'error');
      showPrinterResult(printerId, { success: false, error: error.message });
    } finally {
      state.collecting.delete(printerId);
      updatePrinterCardStatus(printerId);
    }
  }

  // Coleta contadores de todas
  async function collectAllCounters() {
    elements.btnCollectAll.disabled = true;
    elements.btnCollectAll.textContent = '⏳ Coletando...';
    
    // Desabilita botões individuais
    state.printers.forEach(p => state.collecting.add(p.id));
    renderPrintersGrid();
    
    try {
      const data = await api.collectCounters();
      const { results, summary } = data;
      
      // Atualiza resultados nos cards
      results.forEach(result => showPrinterResult(result.printerId, result));
      
      // Toast com resumo
      const msg = `Coleta finalizada: ${summary.success} sucesso, ${summary.error} erro (${summary.durationMs}ms)`;
      showToast(msg, summary.error > 0 ? 'warning' : 'success');
      
    } catch (error) {
      showToast('Erro na coleta em lote: ' + error.message, 'error');
    } finally {
      elements.btnCollectAll.disabled = false;
      elements.btnCollectAll.textContent = '📊 Coletar Todas';
      state.printers.forEach(p => state.collecting.delete(p.id));
      renderPrintersGrid();
    }
  }

  // Mostra resultado no card da impressora
  function showPrinterResult(printerId, result) {
    const resultEl = document.getElementById(`result-${printerId}`);
    if (!resultEl) return;
    
    const printer = state.printers.find(p => p.id === printerId);
    const printerName = printer?.name || printerId;
    
    if (result.success) {
      const fileName = result.filePath ? result.filePath.split('/').pop().split('\\').pop() : 'arquivo';
      resultEl.className = 'printer-card-last-result visible success';
      resultEl.innerHTML = `
        <strong>✅ Sucesso</strong><br>
        Arquivo: <code>${escapeHtml(fileName)}</code><br>
        Tipo: ${result.fileType?.toUpperCase() || 'N/A'} | ${formatFileSize(result.fileSize)}<br>
        ${new Date(result.collectedAt).toLocaleString('pt-BR')}
      `;
    } else {
      resultEl.className = 'printer-card-last-result visible error';
      resultEl.innerHTML = `
        <strong>❌ Erro</strong><br>
        ${escapeHtml(result.error || 'Erro desconhecido')}<br>
        <button class="btn btn-sm btn-primary" onclick="collectSingleCounter('${printerId}')" style="margin-top: 0.5rem;">
          🔄 Tentar Novamente
        </button>
      `;
    }
  }

  // Atualiza status visual do card
  function updatePrinterCardStatus(printerId) {
    const statusEl = document.getElementById(`status-${printerId}`);
    const badgeEl = document.getElementById(`badge-${printerId}`);
    const collectBtn = document.getElementById(`collect-${printerId}`);
    const checkBtn = document.getElementById(`check-${printerId}`);
    
    const isCollecting = state.collecting.has(printerId);
    const isChecking = state.checkingAccessibility.has(printerId);
    
    if (statusEl) {
      if (isCollecting) {
        statusEl.innerHTML = '<div class="spinner"></div><span>Coletando contador...</span>';
      } else if (isChecking) {
        statusEl.innerHTML = '<div class="spinner"></div><span>Verificando acessibilidade...</span>';
      } else {
        statusEl.innerHTML = '';
      }
    }
    
    if (collectBtn) {
      collectBtn.disabled = isCollecting;
      collectBtn.classList.toggle('disabled', isCollecting);
      collectBtn.textContent = isCollecting ? '⏳ Coletando...' : '📊 Coletar';
    }
    
    if (checkBtn) {
      checkBtn.disabled = isChecking;
      checkBtn.classList.toggle('disabled', isChecking);
      checkBtn.textContent = isChecking ? '⏳ Verificando...' : '🔄 Verificar';
    }
  }

  // Mostra detalhes da impressora no modal
  function showPrinterDetails(printer) {
    elements.modalTitle.textContent = printer.name;
    
    const accessibility = printer.accessibility;
    const accText = accessibility?.accessible === true ? '🟢 Acessível' 
      : accessibility?.accessible === false ? '🔴 Inacessível' 
      : accessibility?.accessible === null ? '⏳ Verificando...' 
      : '❓ Não verificado';
    
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
        🔄 Verificar Acessibilidade
      </button>
      <button class="btn btn-primary" onclick="collectSingleCounter('${printer.id}'); closeModal();">
        📊 Coletar Contador
      </button>
    `;
    
    openModal();
  }

  // Modal functions
  function openModal() {
    elements.modalOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    elements.modalOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  // Toast notifications
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Fechar">×</button>
    `;
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    });
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  }

  // Loading overlay
  function showLoading(show) {
    let overlay = document.querySelector('.loading-overlay');
    if (show) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
          <div class="loading-spinner"></div>
          <span>Carregando...</span>
        `;
        document.body.appendChild(overlay);
      }
    } else if (overlay) {
      overlay.remove();
    }
  }

  // Utilitários
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

  // Expõe funções globalmente para onclick inline
  window.collectSingleCounter = collectSingleCounter;
  window.checkSingleAccessibility = checkSingleAccessibility;

  // Inicia
  init();
});