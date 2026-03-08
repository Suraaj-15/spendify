export function shouldRequireDeleteConfirmation(targetCount, confirmFlag) {
  return targetCount > 1 && confirmFlag !== true;
}

export function resolveContextExpenseId(explicitId, lastN, contextLastExpenseId, sortedExpenseIds) {
  if (explicitId) return Number(explicitId);
  if (lastN && sortedExpenseIds[lastN - 1] !== undefined) return Number(sortedExpenseIds[lastN - 1]);
  if (contextLastExpenseId) return Number(contextLastExpenseId);
  return sortedExpenseIds[0] !== undefined ? Number(sortedExpenseIds[0]) : null;
}

