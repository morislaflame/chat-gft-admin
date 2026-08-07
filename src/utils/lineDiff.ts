export type DiffOp = "equal" | "add" | "remove";

export interface DiffLine {
  op: DiffOp;
  text: string;
  oldLine: number | null;
  newLine: number | null;
}

export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
}

function splitLines(text: string): string[] {
  if (!text) return [];
  // Preserve trailing empty line semantics for editors
  const lines = text.split("\n");
  return lines;
}

/**
 * Classic LCS line diff — fine for prompt-sized texts (usually < 500 lines).
 */
export function computeLineDiff(oldText: string, newText: string): DiffLine[] {
  const a = splitLines(oldText);
  const b = splitLines(newText);
  const n = a.length;
  const m = b.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let oldLine = 1;
  let newLine = 1;

  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ op: "equal", text: a[i], oldLine, newLine });
      i += 1;
      j += 1;
      oldLine += 1;
      newLine += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ op: "remove", text: a[i], oldLine, newLine: null });
      i += 1;
      oldLine += 1;
    } else {
      result.push({ op: "add", text: b[j], oldLine: null, newLine });
      j += 1;
      newLine += 1;
    }
  }
  while (i < n) {
    result.push({ op: "remove", text: a[i], oldLine, newLine: null });
    i += 1;
    oldLine += 1;
  }
  while (j < m) {
    result.push({ op: "add", text: b[j], oldLine: null, newLine });
    j += 1;
    newLine += 1;
  }

  return result;
}

export function summarizeDiff(lines: DiffLine[]): DiffStats {
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  for (const line of lines) {
    if (line.op === "add") additions += 1;
    else if (line.op === "remove") deletions += 1;
    else unchanged += 1;
  }
  return { additions, deletions, unchanged };
}
