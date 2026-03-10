/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Controle de Concorrência
 * ============================================================
 * Wrapper para LockService.getDocumentLock() com retry
 * e exponential backoff. TODA operação de escrita no sistema
 * deve usar withDocumentLock().
 * ============================================================
 */

/**
 * Executa uma função callback sob lock de documento com retry e backoff.
 *
 * - Adquire LockService.getDocumentLock() com timeout configurável
 * - Até CONFIG_LOCK.RETRY_COUNT tentativas com exponential backoff
 * - Chama SpreadsheetApp.flush() antes de liberar o lock
 * - Loga falhas de lock para auditoria
 *
 * @param {Function} callback       - Função a executar enquanto segura o lock.
 *                                    Pode retornar qualquer valor.
 * @param {string}   operationName  - Nome da operação (para log e mensagem de erro).
 * @returns {*} O valor retornado pelo callback.
 * @throws {Error} Se o lock não puder ser adquirido após todas as tentativas,
 *                 ou se o callback lançar exceção.
 */
function withDocumentLock(callback, operationName) {
  var lock = LockService.getDocumentLock();
  var acquired = false;
  var lastError = null;

  for (var attempt = 0; attempt < CONFIG_LOCK.RETRY_COUNT; attempt++) {
    try {
      acquired = lock.tryLock(CONFIG_LOCK.TIMEOUT_MS);
      if (acquired) break;
    } catch (e) {
      lastError = e;
    }

    // Exponential backoff: 1s, 2s, 4s ...
    if (attempt < CONFIG_LOCK.RETRY_COUNT - 1) {
      var backoffMs = CONFIG_LOCK.RETRY_BASE_MS * Math.pow(2, attempt);
      Utilities.sleep(backoffMs);
    }
  }

  if (!acquired) {
    logAction('LOCK_FAILURE', operationName + ' - nao foi possivel adquirir lock apos '
              + CONFIG_LOCK.RETRY_COUNT + ' tentativa(s)'
              + (lastError ? ' | Erro: ' + lastError.message : ''));
    throw new Error('O sistema esta ocupado. Por favor, tente novamente em alguns segundos. ('
                    + operationName + ')');
  }

  try {
    var result = callback();
    // Garante que todas as escritas pendentes foram aplicadas ANTES de liberar o lock
    SpreadsheetApp.flush();
    return result;
  } catch (e) {
    logAction('ERROR', operationName + ': ' + e.message);
    throw e;
  } finally {
    lock.releaseLock();
  }
}
