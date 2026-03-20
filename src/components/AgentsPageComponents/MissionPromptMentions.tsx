import { useMemo } from "react";
import { MentionsInput, Mention } from "react-mentions";

type ArtifactForMention = { id: number; code: string; name: string };

export default function MissionPromptMentions({
  value,
  onChange,
  artifacts,
  minRows = 10,
}: {
  value: string;
  onChange: (next: string) => void;
  artifacts: ArtifactForMention[];
  minRows?: number;
}) {
  const data = useMemo(
    () =>
      (artifacts || []).map((a) => ({
        id: a.code,
        display: `${a.name} (${a.code})`,
      })),
    [artifacts]
  );

  // Type "@" to see artifact suggestions. Insert @artifact(code) for ACQUIRE (1 piece).
  const style = {
    control: {
      fontSize: 14,
      lineHeight: 1.4,
      fontFamily: "inherit",
      backgroundColor: "transparent",
    },
    highlighter: {
      overflow: "hidden",
      padding: 10,
      border: "1px solid rgba(120, 120, 120, 0.25)",
      borderRadius: 12,
      minHeight: `${minRows * 24}px`,
      // Keep plain text invisible in the highlighter, show only highlight "chips".
      // The actual text is rendered by the input (on top).
      color: "transparent",
    },
    input: {
      margin: 0,
      padding: 10,
      border: "1px solid rgba(120, 120, 120, 0.25)",
      borderRadius: 12,
      minHeight: `${minRows * 24}px`,
      // react-mentions renders a highlighter + an input on top.
      // Text should be visible only once (in the input), while the highlighter provides backgrounds/borders for mentions.
      color: "rgba(252, 252, 252, 0.93)",
      caretColor: "rgba(252, 252, 252, 0.93)",
      backgroundColor: "transparent",
    },
    suggestions: {
      list: {
        backgroundColor: "#111827",
        border: "1px solid rgba(255,255,255,0.12)",
        fontSize: 13,
      },
      item: {
        padding: "8px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        color: "#fff",
      },
    },
  } as const;

  return (
    <div className="space-y-1">
      <div className="text-sm text-white">
        Tip: type <code>@</code> to insert artifact (e.g. &quot;@artifact(CODE)&quot;).
      </div>
      <MentionsInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={style}
        allowSuggestionsAboveCursor
        singleLine={false}
      >
        <Mention
          trigger="@"
          data={data}
          markup="@artifact(__id__)"
          displayTransform={(id) => `@artifact(${id})`}
          style={{
            backgroundColor: "rgba(250, 204, 21, 0.18)",
            border: "1px solid rgba(250, 204, 21, 0.35)",
            borderRadius: 999,
            padding: "1px 6px",
            color: "transparent",
          }}
        />
      </MentionsInput>
    </div>
  );
}

