import { useEffect, useMemo, useRef } from "react";

interface PromptCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  wrap?: boolean;
  readOnly?: boolean;
  ariaLabel?: string;
}

export function PromptCodeEditor({
  value,
  onChange,
  wrap = false,
  readOnly = false,
  ariaLabel = "Текст промпта",
}: PromptCodeEditorProps) {
  const lineCount = useMemo(() => {
    if (!value) return 1;
    return value.split("\n").length;
  }, [value]);

  const gutterRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textRef.current;
    const gutter = gutterRef.current;
    if (!ta || !gutter) return;
    const sync = () => {
      gutter.scrollTop = ta.scrollTop;
    };
    ta.addEventListener("scroll", sync);
    return () => ta.removeEventListener("scroll", sync);
  }, []);

  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1).join("\n"),
    [lineCount]
  );

  const chars = value.length;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5 text-[11px] text-zinc-500">
        <span>
          {lineCount} строк · {chars.toLocaleString()} символов · ~{words} слов
        </span>
        {readOnly ? <span className="text-zinc-600">только чтение</span> : null}
      </div>
      <div className="relative min-h-0 flex-1 flex">
        <div
          ref={gutterRef}
          aria-hidden
          className="w-12 shrink-0 overflow-hidden border-r border-zinc-800 bg-zinc-900/80 px-2 py-3 text-right font-mono text-[12px] leading-5 text-zinc-600 select-none whitespace-pre"
        >
          {lineNumbers}
        </div>
        <textarea
          ref={textRef}
          aria-label={ariaLabel}
          spellCheck={false}
          readOnly={readOnly}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`min-h-0 flex-1 resize-none bg-transparent px-3 py-3 font-mono text-[12px] leading-5 text-zinc-100 outline-none ${
            wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"
          }`}
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  );
}
