export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportFilename(prefix: string, extension = "json"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.${extension}`;
}
