/**
 * Cliente API para comunicação com o backend.
 */
class ApiClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conexão com o servidor. Verifique se o backend está rodando.');
      }
      throw error;
    }
  }

  // Printers
  async getPrinters(checkAccessibility = false) {
    const params = checkAccessibility ? '?checkAccessibility=true' : '';
    return this.request(`/printers${params}`);
  }

  async getPrinter(id) {
    return this.request(`/printers/${id}`);
  }

  async checkPrinterAccessibility(id, force = false) {
    const params = force ? '?force=true' : '';
    return this.request(`/printers/${id}/accessibility${params}`);
  }

  async checkAllPrintersAccessibility(force = false) {
    return this.request('/printers/check-accessibility', {
      method: 'POST',
      body: { force }
    });
  }

  async clearAccessibilityCache() {
    return this.request('/printers/clear-cache', { method: 'POST' });
  }

  // Counters
  async collectCounters(printerIds = null) {
    return this.request('/counters/collect', {
      method: 'POST',
      body: { printerIds }
    });
  }

  async collectSingleCounter(printerId) {
    return this.request(`/counters/collect/${printerId}`, {
      method: 'POST'
    });
  }

  // History
  async getHistory(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    return this.request(`/history?${query.toString()}`);
  }

  async getHistoryStats() {
    return this.request('/history/stats');
  }

  async getHistoryRecord(id) {
    return this.request(`/history/${id}`);
  }

  getFileUrl(id, download = false) {
    const params = download ? '?download=true' : '';
    return `${this.baseUrl}/history/${id}/file${params}`;
  }

  // Health
  async healthCheck() {
    return this.request('/health');
  }
}

// Instância global
const api = new ApiClient();