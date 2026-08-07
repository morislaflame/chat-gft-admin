import { useMemo } from "react";
import { computeLineDiff, summarizeDiff, type DiffLine } from "@/utils/lineDiff";

interface PromptDiffViewProps {
  oldText: string;
  newText: string;
  oldLabel?: string;
  newLabel?: string;
  wrap?: boolean;
}

function lineClass(op: DiffLine["op"]): string {
  if (op === "add") return "bg-emerald-500/15 text-emerald-100";
  if (op === "remove") return "bg-rose-500/15 text-rose-100";
  return "text-zinc-300";
}

function gutterMark(op: DiffLine["op"]): string {
  if (op === "add") return "+";
  if (op === "remove") return "-";
  return " ";
}

export function PromptDiffView({
  oldText,
  newText,
  oldLabel = "Было",
  newLabel = "Стало",
  wrap = false,
}: PromptDiffViewProps) {
  const lines = useMemo(() => computeLineDiff(oldText, newText), [oldText, newText]);
  const stats = useMemo(() => summarizeDiff(lines), [lines]);
  const identical = stats.additions === 0 && stats.deletions === 0;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Сравнение: <span className="text-zinc-200">{oldLabel}</span>
            <span className="mx-1 text-zinc-600">→</span>
            <span className="text-zinc-200">{newLabel}</span>
          </span>
          {identical ? (
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">тексты одинаковые</span>
          ) : (
            <span className="flex gap-2">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                добавлено строк: {stats.additions}
              </span>
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-rose-300">
                удалено строк: {stats.deletions}
              </span>
            </span>
          )}
        </div>
        <span className="text-zinc-600">всего строк в сравнении: {lines.length}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto font-mono text-[12px] leading-5">
        {lines.length === 0 ? (
          <div className="p-4 text-zinc-500">Оба текста пустые</div>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={`${line.op}-${line.oldLine}-${line.newLine}-${idx}`} className={lineClass(line.op)}>
                  <td className="w-10 select-none border-r border-zinc-800/80 px-2 text-right text-zinc-600 align-top">
                    {line.oldLine ?? ""}
                  </td>
                  <td className="w-10 select-none border-r border-zinc-800/80 px-2 text-right text-zinc-600 align-top">
                    {line.newLine ?? ""}
                  </td>
                  <td className="w-5 select-none px-1 text-center align-top text-zinc-500">
                    {gutterMark(line.op)}
                  </td>
                  <td
                    className={`px-2 py-0 align-top ${
                      wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
                    }`}
                  >
                    {line.text.length ? line.text : " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
