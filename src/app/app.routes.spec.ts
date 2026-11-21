import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { Router, provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAppLocale } from './core/i18n/locale';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideAppLocale()] });
  });

  it('lazy-loads every page', () => {
    const eager = routes.filter(route => route.component);
    expect(eager).toEqual([]);
  });

  it('shows the not-found page for unknown URLs', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/nao-existe');
    expect(harness.routeNativeElement?.textContent).toContain('Página não encontrada');
    expect(harness.routeNativeElement?.textContent).toContain('/nao-existe');
  });

  it('redirects the root to the home page', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/home');
    expect(harness.routeNativeElement?.tagName).toBe('APP-HOME');
  });
});
