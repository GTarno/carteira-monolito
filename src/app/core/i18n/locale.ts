import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {
  DEFAULT_CURRENCY_CODE,
  EnvironmentProviders,
  LOCALE_ID,
  makeEnvironmentProviders
} from '@angular/core';

export const APP_LOCALE = 'pt-BR';
export const APP_CURRENCY = 'BRL';

/**
 * Registra os dados de locale pt-BR e define o idioma/moeda padrão da aplicação.
 * Com isso os pipes `currency`, `number` e `date` formatam em pt-BR/BRL sem parâmetros extras.
 */
export function provideAppLocale(): EnvironmentProviders {
  registerLocaleData(localePt, APP_LOCALE);
  return makeEnvironmentProviders([
    { provide: LOCALE_ID, useValue: APP_LOCALE },
    { provide: DEFAULT_CURRENCY_CODE, useValue: APP_CURRENCY }
  ]);
}

/** Formata um valor em reais (para uso fora de templates, ex.: callbacks do Chart.js e aria-labels). */
export function formatBRL(value: number): string {
  return value.toLocaleString(APP_LOCALE, { style: 'currency', currency: APP_CURRENCY });
}
