import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Registrar dados de locale português
registerLocaleData(localePt, 'pt');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
