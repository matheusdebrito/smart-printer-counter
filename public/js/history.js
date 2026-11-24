/**
 * Página de Histórico - Smart Printer Counter
 */
document.addEventListener('DOMContentLoaded', () => {
  // Estado
  const state = {
    printers: [],
    filters: {
      printerId: '',
      status: '',
      startDate: '',
      endDate: '',
      page: 1,
      pageSize: 20,
      sortBy: 'collected_at',
      sortOrder: 'DESC'
    },
    pagination: {
      total: 0,
      totalPages: 0,
      currentPage: 1
    }
  };

  // Elementos DOM
  const elements = {
    // Filtros
    filterPrinter: document.getElementById('filter-printer'),
    filterStatus: document.getElementById('filter-status'),
    filterStartDate: document.getElementById('filter-start-date'),
    filterEndDate: document.getElementById('filter-end-date'),
    btnApplyFilters: document.getElementById('btn-apply-filters'),
    btnClearFilters: document.getElementById('btn-clear-filters'),
    pageSize: document.getElementById('page-size'),
    
    // Tabela
    historyTbody: document.getElementById('history-tbody'),
    historyEmpty: document.getElementById('history-empty'),
    historyTable: document.getElementById('history-table'),
    tableHeaders: document.querySelectorAll('#history-table th[data-sort]'),
    
    // Paginação
    btnPrevPage: document.getElementById('btn-prev-page'),
    btnNextPage: document.getElementById('btn-next-page'),
    paginationInfo: document.getElementById('pagination-info'),
    
    // Stats
    historyTotal: document.getElementById('history-total'),
    historySuccess: document.getElementById('history-success'),
    historyError: document.getElementById('history-error'),
    
    // Actions
    btnRefresh: document.getElementById('btn-refresh-history'),
    btnExport: document.getElementById('btn-export-history'),
    
    // Modal arquivo
    fileModal: document.getElementById('file-modal'),
    fileModalTitle: document.getElementById('file-modal-title'),
    fileModalBody: document.getElementById('file-modal-body'),
    fileModalClose: document.getElementById('file-modal-close'),
    fileModalCloseBtn: document.getElementById('file-modal-close-btn'),
    fileModalDownload: document.getElementById('file-modal-download'),
    
    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  // Inicialização
  async function init() {
    await loadPrintersForFilter();
    await loadHistory();
    await loadStats();
    setupEventListeners();
  }

  // Event Listeners
  function setupEventListeners() {
    // Filtros
    elements.btnApplyFilters.addEventListener('click', applyFilters);
    elements.btnClearFilters.addEventListener('click', clearFilters);
    elements.pageSize.addEventListener('change', (e) => {
      state.filters.pageSize = parseInt(e.target.value);
      state.filters.page = 1;
      loadHistory();
    });
    
    // Enter nos campos de data
    [elements.filterStartDate, elements.filterEndDate].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
      });
    });
    
    // Ordenação
    elements.tableHeaders.forEach(th => {
      th.addEventListener('click', () => handleSort(th.dataset.sort));
    });
    
    // Paginação
    elements.btnPrevPage.addEventListener('click', () => goToPage(state.pagination.currentPage - 1));
    elements.btnNextPage.addEventListener('click', () => goToPage(state.pagination.currentPage + 1));
    
    // Actions
    elements.btnRefresh.addEventListener('click', () => loadHistory());
    elements.btnExport.addEventListener('click', exportCSV);
    
    // Modal
    elements.fileModalClose.addEventListener('click', closeFileModal);
    elements.fileModalCloseBtn.addEventListener('click', closeFileModal);
    elements.fileModal.addEventListener('click', (e) => {
      if (e.target === elements.fileModal) closeFileModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeFileModal();
    });
  }

  // Carrega impressoras para o filtro
  async function loadPrintersForFilter() {
    try {
      const data = await api.getPrinters(false);
      state.printers = data.printers || [];
      
      elements.filterPrinter.innerHTML = '<option value="">Todas</option>' +
        state.printers.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    } catch (error) {
      console.error('Erro ao carregar impressoras para filtro:', error);
    }
  }

  // Carrega histórico
  async function loadHistory() {
    showTableLoading(true);
    
    try {
      const params = { ...state.filters };
      const data = await api.getHistory(params);
      
      state.pagination = {
        total: data.total,
        totalPages: data.totalPages,
        currentPage: data.page
      };
      
      renderHistoryTable(data.data);
      updatePagination();
      updateStatsDisplay();
    } catch (error) {
      showToast('Erro ao carregar histórico: ' + error.message, 'error');
      console.error(error);
    } finally {
      showTableLoading(false);
    }
  }

  // Carrega estatísticas
  async function loadStats() {
    try {
      const stats = await api.getHistoryStats();
      elements.historyTotal.textContent = stats.total;
      elements.historySuccess.textContent = stats.success;
      elements.historyError.textContent = stats.error;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  // Renderiza tabela
  function renderHistoryTable(records) {
    const { historyTbody, historyEmpty } = elements;
    
    if (!records || records.length === 0) {
      historyTbody.innerHTML = '';
      historyEmpty.style.display = 'block';
      return;
    }
    
    historyEmpty.style.display = 'none';
    historyTbody.innerHTML = records.map(record => createTableRow(record)).join('');
    
    // Adiciona event listeners aos botões
    records.forEach(record => {
      const viewBtn = document.getElementById(`view-${record.id}`);
      const downloadBtn = document.getElementById(`download-${record.id}`);
      
      if (viewBtn) viewBtn.addEventListener('click', () => openFileModal(record));
      if (downloadBtn) downloadBtn.addEventListener('click', () => downloadFile(record));
    });
  }

  // Cria linha da tabela
  function createTableRow(record) {
    const statusClass = record.status === 'success' ? 'success' : 'error';
    const statusText = record.status === 'success' ? '✅ Sucesso' : '❌ Erro';
    const fileTypeClass = record.file_type === 'pdf' ? 'pdf' : 'png';
    const fileTypeText = record.file_type?.toUpperCase() || 'N/A';
    const fileName = record.file_path ? record.file_path.split('/').pop().split('\\').pop() : 'N/A';
    const collectedAt = new Date(record.collected_at).toLocaleString('pt-BR');
    
    return `
      <tr data-id="${record.id}">
        <td>${escapeHtml(collectedAt)}</td>
        <td>
          <strong>${escapeHtml(record.printer_name)}</strong>
          <br><small style="color: var(--text-secondary);">${escapeHtml(record.printer_id)}</small>
        </td>
        <td><span class="file-type-badge ${fileTypeClass}">${fileTypeText}</span></td>
        <td>${formatFileSize(record.file_size)}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td class="actions-cell">
          <button class="btn btn-secondary btn-action btn-sm" id="view-${record.id}" title="Visualizar">
            👁️ Ver
          </button>
          <button class="btn btn-primary btn-action btn-sm" id="download-${record.id}" title="Baixar">
            ⬇️ Baixar
          </button>
          ${record.status === 'error' ? `
            <span class="error-tooltip" title="${escapeHtml(record.error_message || 'Erro desconhecido')}">⚠️</span>
          ` : ''}
        </td>
      </tr>
    `;
  }

  // Atualiza paginação
  function updatePagination() {
    const { currentPage, totalPages } = state.pagination;
    
    elements.paginationInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
    elements.btnPrevPage.disabled = currentPage <= 1;
    elements.btnNextPage.disabled = currentPage >= totalPages;
  }

  // Vai para página
  function goToPage(page) {
    if (page < 1 || page > state.pagination.totalPages) return;
    state.filters.page = page;
    loadHistory();
  }

  // Ordenação
  function handleSort(field) {
    const allowedFields = ['collected_at', 'printer_name', 'file_type', 'status'];
    if (!allowedFields.includes(field)) return;
    
    if (state.filters.sortBy === field) {
      state.filters.sortOrder = state.filters.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    } else {
      state.filters.sortBy = field;
      state.filters.sortOrder = 'DESC';
    }
    
    // Atualiza UI dos headers
    elements.tableHeaders.forEach(th => {
      th.classList.remove('sorted-asc', 'sorted-desc');
      if (th.dataset.sort === field) {
        th.classList.add(state.filters.sortOrder === 'ASC' ? 'sorted-asc' : 'sorted-desc');
      }
    });
    
    state.filters.page = 1;
    loadHistory();
  }

  // Aplica filtros
  function applyFilters() {
    state.filters = {
      ...state.filters,
      printerId: elements.filterPrinter.value,
      status: elements.filterStatus.value,
      startDate: elements.filterStartDate.value,
      endDate: elements.filterEndDate.value,
      page: 1,
      pageSize: parseInt(elements.pageSize.value)
    };
    loadHistory();
  }

  // Limpa filtros
  function clearFilters() {
    elements.filterPrinter.value = '';
    elements.filterStatus.value = '';
    elements.filterStartDate.value = '';
    elements.filterEndDate.value = '';
    
    state.filters = {
      ...state.filters,
      printerId: '',
      status: '',
      startDate: '',
      endDate: '',
      page: 1
    };
    loadHistory();
  }

  // Exporta CSV
  async function exportCSV() {
    try {
      showToast('Preparando exportação...', 'info');
      
      // Busca todos os registros (sem paginação)
      const data = await api.getHistory({
        ...state.filters,
        page: 1,
        pageSize: 10000 // Limite alto para exportar tudo
      });
      
      if (!data.data || data.data.length === 0) {
        showToast('Nenhum dado para exportar', 'warning');
        return;
      }
      
      const headers = ['Data/Hora', 'Impressora', 'ID Impressora', 'Tipo', 'Tamanho', 'Status', 'Erro'];
      const rows = data.data.map(r => [
        new Date(r.collected_at).toLocaleString('pt-BR'),
        r.printer_name,
        r.printer_id,
        r.file_type?.toUpperCase() || '',
        r.file_size || 0,
        r.status === 'success' ? 'Sucesso' : 'Erro',
        r.error_message || ''
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historico-contadores-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(`${data.data.length} registros exportados`, 'success');
    } catch (error) {
      showToast('Erro ao exportar: ' + error.message, 'error');
    }
  }

  // Modal de arquivo
  function openFileModal(record) {
    const fileUrl = api.getFileUrl(record.id, false);
    const downloadUrl = api.getFileUrl(record.id, true);
    const fileName = record.file_path ? record.file_path.split('/').pop().split('\\').pop() : 'arquivo';
    const isPdf = record.file_type === 'pdf';
    const isImage = record.file_type === 'png';
    
    elements.fileModalTitle.textContent = `${record.printer_name} - ${fileName}`;
    elements.fileModalDownload.href = downloadUrl;
    elements.fileModalDownload.download = fileName;
    
    if (isPdf) {
      elements.fileModalBody.innerHTML = `
        <iframe class="file-viewer" src="${fileUrl}" title="${escapeHtml(fileName)}"></iframe>
      `;
    } else if (isImage) {
      elements.fileModalBody.innerHTML = `
        <img class="file-viewer-img" src="${fileUrl}" alt="${escapeHtml(fileName)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <div style="display:none; text-align:center; padding:2rem; color:var(--text-secondary);">
          Não foi possível carregar a imagem.<br>
          <a href="${downloadUrl}" class="btn btn-primary" style="margin-top:1rem;">Baixar arquivo</a>
        </div>
      `;
    } else {
      elements.fileModalBody.innerHTML = `
        <div style="text-align:center; padding:2rem; color:var(--text-secondary);">
          Tipo de arquivo não suportado para visualização.<br>
          <a href="${downloadUrl}" class="btn btn-primary" style="margin-top:1rem;">Baixar arquivo</a>
        </div>
      `;
    }
    
    elements.fileModal.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeFileModal() {
    elements.fileModal.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function downloadFile(record) {
    const downloadUrl = api.getFileUrl(record.id, true);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = record.file_path ? record.file_path.split('/').pop().split('\\').pop() : 'arquivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Download iniciado', 'success');
  }

  // Atualiza stats display (para contagem local se necessário)
  function updateStatsDisplay() {
    // As stats globais já são carregadas separadamente
  }

  // Table loading state
  function showTableLoading(show) {
    const { historyTbody } = elements;
    if (show) {
      historyTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:3rem; color:var(--text-secondary);">
            <div class="loading-spinner" style="margin:0 auto 1rem;"></div>
            Carregando histórico...
          </td>
        </tr>
      `;
    }
  }

  // Toast
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
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
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

  // Inicia
  init();
});