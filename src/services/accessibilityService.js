/**
 * Serviço para verificar acessibilidade das impressoras via HTTP.
 * Faz requisições HEAD/GET rápidas para verificar se a impressora responde.
 */
const { printers } = require('../config/printers');

// Cache simples em memória (30 segundos)
const accessibilityCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 segundos

/**
 * Verifica se uma URL está acessível.
 * @param {string} url - URL para verificar
 * @param {number} timeout - Timeout em ms (padrão: 5000)
 * @returns {Promise<boolean>}
 */
async function checkUrlAccessible(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      // Não seguir redirects para ser mais rápido
      redirect: 'manual'
    });
    clearTimeout(timeoutId);
    // Considera acessível se responde (mesmo 401, 403, etc - significa que o servidor respondeu)
    return response.status < 500;
  } catch (error) {
    clearTimeout(timeoutId);
    // Erro de network, timeout, abort = inacessível
    return false;
  }
}

/**
 * Verifica acessibilidade de uma impressora específica.
 * @param {string} printerId - ID da impressora
 * @param {boolean} forceRefresh - Força nova verificação ignorando cache
 * @returns {Promise<Object>} Resultado da verificação
 */
async function checkPrinterAccessibility(printerId, forceRefresh = false) {
  const printer = printers.find(p => p.id === printerId);
  if (!printer) {
    return {
      printerId,
      printerName: printerId,
      accessible: false,
      checkedAt: new Date().toISOString(),
      error: 'Impressora não encontrada'
    };
  }

  const cacheKey = printerId;
  const cached = accessibilityCache.get(cacheKey);
  
  if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return {
      printerId,
      printerName: printer.name,
      accessible: cached.accessible,
      checkedAt: cached.checkedAt,
      cached: true
    };
  }

  const accessible = await checkUrlAccessible(printer.checkUrl);
  const checkedAt = new Date().toISOString();
  
  accessibilityCache.set(cacheKey, { accessible, checkedAt, timestamp: Date.now() });
  
  return {
    printerId,
    printerName: printer.name,
    accessible,
    checkedAt,
    cached: false
  };
}

/**
 * Verifica acessibilidade de todas as impressoras.
 * @param {boolean} forceRefresh - Força nova verificação
 * @returns {Promise<Object[]>} Array de resultados
 */
async function checkAllPrintersAccessibility(forceRefresh = false) {
  const results = await Promise.all(
    printers.map(p => checkPrinterAccessibility(p.id, forceRefresh))
  );
  return results;
}

/**
 * Limpa o cache de acessibilidade.
 */
function clearAccessibilityCache() {
  accessibilityCache.clear();
}

module.exports = {
  checkPrinterAccessibility,
  checkAllPrintersAccessibility,
  clearAccessibilityCache
};