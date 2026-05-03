/**
 * OmniRule Compliance Checker (Karpathy Logic)
 */

export const auditCodeChange = (filePath: string, content: string) => {
  const issues: string[] = [];
  const lines = content.split('\n');

  // 1. Complexity Audit: File Length
  if (lines.length > 500) {
    issues.push(`File ${filePath} is too long (${lines.length} lines). Karpathy says: "Keep it surgical". Consider splitting into smaller modules.`);
  }

  // 2. Logic Density: Deep Nesting
  const deepNesting = content.match(/ {8,}\{/g); // Simplistic check for deep indentation
  if (deepNesting && deepNesting.length > 5) {
    issues.push(`Deep nesting detected in ${filePath}. High cognitive load. Simplify the logic flow.`);
  }

  // 3. Documentation Audit: Missing TSDoc/JSDoc
  if (['.ts', '.js'].some(e => filePath.endsWith(e)) && !content.includes('/**')) {
    issues.push(`Public exports in ${filePath} are missing documentation. Document the "Why", not just the "How".`);
  }

  return {
    isCompliant: issues.length === 0,
    issues
  };
};
