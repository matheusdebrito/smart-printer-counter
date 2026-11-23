/**
 * Serviço de histórico de contadores usando SQLite.
 * Gerencia persistência de metadados das coletas.
 */
const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'history.db');

// Inicializa o banco de dados
const db = new Database(DB_PATH);

// Cria tabela se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS counter_history (
    id TEXT PRIMARY KEY,
    printer_id TEXT NOT NULL,
    printer_name TEXT NOT NULL,
    file_path TEXT,
    file_type TEXT,
    file_size INTEGER DEFAULT 0,
    collected_at TEXT NOT NULL,
    status TEXT NOT NULL, -- 'success' | 'error'
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_counter_history_printer 
  ON counter_history(printer_id);
  
  CREATE INDEX IF NOT EXISTS idx_counter_history_collected 
  ON counter_history(collected_at DESC);
`);

/**
 * Salva um registro de coleta no histórico.
 * @param {Object} record - Registro de coleta
 * @returns {Object} Registro salvo com ID
 */
function saveHistoryRecord(record) {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO counter_history 
    (id, printer_id, printer_name, file_path, file_type, file_size, collected_at, status, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    record.printerId,
    record.printerName,
    record.filePath,
    record.fileType,
    record.fileSize || 0,
    record.collectedAt,
    record.success ? 'success' : 'error',
    record.error || null
  );
  
  return { ...record, id };
}

/**
 * Salva múltiplos registros de coleta.
 * @param {Object[]} records - Array de registros
 * @returns {Object[]} Registros salvos
 */
function saveMultipleHistoryRecords(records) {
  const stmt = db.prepare(`
    INSERT INTO counter_history 
    (id, printer_id, printer_name, file_path, file_type, file_size, collected_at, status, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const transaction = db.transaction((records) => {
    const saved = [];
    for (const record of records) {
      const id = uuidv4();
      stmt.run(
        id,
        record.printerId,
        record.printerName,
        record.filePath,
        record.fileType,
        record.fileSize || 0,
        record.collectedAt,
        record.success ? 'success' : 'error',
        record.error || null
      );
      saved.push({ ...record, id });
    }
    return saved;
  });
  
  return transaction(records);
}

/**
 * Busca histórico com paginação e filtros.
 * @param {Object} options - Opções de busca
 * @returns {Object} { data, total, page, pageSize }
 */
function getHistory(options = {}) {
  const {
    printerId,
    startDate,
    endDate,
    status,
    page = 1,
    pageSize = 20,
    sortBy = 'collected_at',
    sortOrder = 'DESC'
  } = options;
  
  let whereClause = 'WHERE 1=1';
  const params = [];
  
  if (printerId) {
    whereClause += ' AND printer_id = ?';
    params.push(printerId);
  }
  
  if (startDate) {
    whereClause += ' AND collected_at >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    whereClause += ' AND collected_at <= ?';
    params.push(endDate);
  }
  
  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }
  
  // Valida sortBy para evitar SQL injection
  const allowedSortFields = ['collected_at', 'printer_name', 'file_type', 'status'];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'collected_at';
  const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  // Total count
  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM counter_history ${whereClause}`);
  const { total } = countStmt.get(...params);
  
  // Data com paginação
  const offset = (page - 1) * pageSize;
  const dataStmt = db.prepare(`
    SELECT * FROM counter_history 
    ${whereClause}
    ORDER BY ${safeSortBy} ${safeSortOrder}
    LIMIT ? OFFSET ?
  `);
  
  const data = dataStmt.all(...params, pageSize, offset);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * Busca um registro específico por ID.
 * @param {string} id 
 * @returns {Object|null}
 */
function getHistoryById(id) {
  const stmt = db.prepare('SELECT * FROM counter_history WHERE id = ?');
  return stmt.get(id) || null;
}

/**
 * Busca estatísticas gerais.
 * @returns {Object}
 */
function getHistoryStats() {
  const totalStmt = db.prepare('SELECT COUNT(*) as total FROM counter_history');
  const successStmt = db.prepare("SELECT COUNT(*) as total FROM counter_history WHERE status = 'success'");
  const errorStmt = db.prepare("SELECT COUNT(*) as total FROM counter_history WHERE status = 'error'");
  const byPrinterStmt = db.prepare(`
    SELECT printer_id, printer_name, COUNT(*) as count,
           SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
           SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count
    FROM counter_history
    GROUP BY printer_id, printer_name
    ORDER BY count DESC
  `);
  const recentStmt = db.prepare(`
    SELECT * FROM counter_history 
    ORDER BY collected_at DESC 
    LIMIT 10
  `);
  
  return {
    total: totalStmt.get().total,
    success: successStmt.get().total,
    error: errorStmt.get().total,
    byPrinter: byPrinterStmt.all(),
    recent: recentStmt.all()
  };
}

/**
 * Deleta registros antigos (opcional, para manutenção).
 * @param {number} daysToKeep - Dias para manter (padrão: 365)
 * @returns {number} Registros deletados
 */
function cleanupOldRecords(daysToKeep = 365) {
  const stmt = db.prepare(`
    DELETE FROM counter_history 
    WHERE collected_at < datetime('now', ?)
  `);
  const result = stmt.run(`-${daysToKeep} days`);
  return result.changes;
}

module.exports = {
  saveHistoryRecord,
  saveMultipleHistoryRecords,
  getHistory,
  getHistoryById,
  getHistoryStats,
  cleanupOldRecords
};