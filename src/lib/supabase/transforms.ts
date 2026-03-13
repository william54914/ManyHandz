export function rowToDto<T>(row: Record<string, unknown>): T {
  return row as T;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString();
}
