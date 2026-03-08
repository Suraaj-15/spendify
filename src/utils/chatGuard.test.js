import { resolveContextExpenseId, shouldRequireDeleteConfirmation } from "./chatGuard";

describe("chat guard", () => {
  test("requires confirmation only for bulk delete without confirm flag", () => {
    expect(shouldRequireDeleteConfirmation(1, false)).toBe(false);
    expect(shouldRequireDeleteConfirmation(2, false)).toBe(true);
    expect(shouldRequireDeleteConfirmation(2, true)).toBe(false);
  });

  test("resolves context expense id by precedence", () => {
    expect(resolveContextExpenseId(99, null, 3, [7, 6, 5])).toBe(99);
    expect(resolveContextExpenseId(null, 2, 3, [7, 6, 5])).toBe(6);
    expect(resolveContextExpenseId(null, null, 3, [7, 6, 5])).toBe(3);
    expect(resolveContextExpenseId(null, null, null, [7, 6, 5])).toBe(7);
  });
});

