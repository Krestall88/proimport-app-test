// Универсальная функция форматирования суммы в сомах (KGS)
export function formatCurrency(value: number | undefined | null): string {
  // Безопасная обработка undefined/null/NaN
  if (value === undefined || value === null || isNaN(value)) {
    return '0 сом';
  }
  return `${value.toLocaleString('ru-KG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} сом`;
}
