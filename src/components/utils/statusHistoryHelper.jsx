// Helper functions for status_history field (stored as JSON string)

export function parseStatusHistory(statusHistoryString) {
  if (!statusHistoryString) return [];
  if (typeof statusHistoryString !== 'string') return [];
  try {
    const parsed = JSON.parse(statusHistoryString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addStatusEntry(statusHistoryString, newStatus) {
  const history = parseStatusHistory(statusHistoryString);
  history.push({
    status: newStatus,
    timestamp: new Date().toISOString()
  });
  return JSON.stringify(history);
}

export function stringifyStatusHistory(historyArray) {
  if (!historyArray || !Array.isArray(historyArray)) return '[]';
  return JSON.stringify(historyArray);
}