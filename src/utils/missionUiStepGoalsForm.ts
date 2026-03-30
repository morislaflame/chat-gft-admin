/** Обратное преобразование сохранённого JSON в текст для поля админки. */
export function uiStepGoalsToEditableText(goals: unknown): string {
    if (!goals || typeof goals !== 'object') return '';
    const steps = (goals as { steps?: unknown }).steps;
    if (!Array.isArray(steps) || !steps.length) return '';
    const lines: string[] = [];
    for (const s of steps) {
        if (!s || typeof s !== 'object') continue;
        const index = Number((s as { index?: unknown }).index);
        const text = String((s as { text?: unknown }).text ?? '').trim();
        if (!Number.isFinite(index) || index < 1 || !text) continue;
        lines.push(`${index}) ${text}`);
    }
    return lines.join('\n');
}
