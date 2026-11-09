import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Lê um valor digitado em reais: aceita "1.234,56", "1234,56", "1234.56" e "R$ 1.234,56".
 * Retorna `null` se não for um número válido.
 */
export function parseMoney(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;

  let text = input.replace(/R\$|\s/g, '');
  if (!text) return null;
  if (text.includes(',')) {
    text = text.replace(/\./g, '').replace(',', '.');
  }
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  return Number(text);
}

/** Formata um número para edição em campo de texto: 1234.5 → "1234,50". */
export function toMoneyInput(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : value.toFixed(2).replace('.', ',');
}

/**
 * Validador de campo em reais: número válido, no máximo 2 casas decimais e >= `min`.
 * Erros: `invalidMoney`, `tooManyDecimals`, `min`.
 */
export function moneyValidator(min = 0): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value;
    if (raw === null || raw === undefined || raw === '') return null; // o `required` cuida do vazio
    const value = parseMoney(raw);
    if (value === null) return { invalidMoney: true };
    if (Math.round(value * 100) / 100 !== value) return { tooManyDecimals: true };
    if (value < min) return { min: { min, actual: value } };
    return null;
  };
}
