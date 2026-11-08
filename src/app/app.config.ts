import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { TitleStrategy, provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideAppLocale } from './core/i18n/locale';
import { ThemeService } from './core/theme/theme.service';
import { PageTitleStrategy } from './core/routing/page-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
    provideAppLocale(),
    // Instancia o ThemeService na inicialização para sincronizar data-theme e localStorage
    provideAppInitializer(() => { inject(ThemeService); }),
    provideCharts(withDefaultRegisterables())
  ]
};
