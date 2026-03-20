declare module "react-mentions" {
  import type { ChangeEvent, CSSProperties, FC, ReactNode } from "react";

  export interface SuggestionDataItem {
    id: string | number;
    display?: string;
  }

  export const Mention: FC<{
    trigger: string | RegExp;
    data: SuggestionDataItem[];
    markup?: string;
    displayTransform?: (id: string | number, display?: string) => string;
    style?: CSSProperties;
  }>;

  export const MentionsInput: FC<{
    value: string;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    style?: unknown;
    allowSuggestionsAboveCursor?: boolean;
    singleLine?: boolean;
    children?: ReactNode;
  }>;
}
