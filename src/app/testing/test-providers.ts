import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideAppLocale } from '../core/i18n/locale';

/** Providers globais equivalentes aos de `app.config.ts`, para uso nos testes de componentes. */
export function provideTestDefaults(): Array<Provider | EnvironmentProviders> {
  return [
    provideRouter([]),
    provideCharts(withDefaultRegisterables()),
    provideAppLocale()
  ];
}
