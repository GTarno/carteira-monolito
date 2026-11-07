/**
 * Converte uma data ISO só com o dia ('yyyy-mm-dd') para meia-noite no fuso LOCAL.
 *
 * `new Date('yyyy-mm-dd')` é interpretado como meia-noite UTC, o que em UTC-3
 * corresponde às 21h do dia anterior. Use sempre esta função para datas sem hora.
 */
export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Retorna uma nova data com o horário zerado (meia-noite local). */
export function startOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
