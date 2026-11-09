import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, TitleStrategy, provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ShellComponent } from './shell.component';
import { PageTitleStrategy } from '../../core/routing/page-title.strategy';
import { provideAppLocale } from '../../core/i18n/locale';

@Component({ template: '<p class="page">nova</p>' })
class NewPage {}

describe('ShellComponent', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideAppLocale(),
        provideRouter([
          { path: 'nova', component: NewPage, title: 'Nova' }
        ]),
        { provide: TitleStrategy, useClass: PageTitleStrategy }
      ]
    });
    const fixture = TestBed.createComponent(ShellComponent);
    const router = TestBed.inject(Router);
    const go = async (url: string) => {
      await router.navigateByUrl(url);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { fixture, go, el: fixture.nativeElement as HTMLElement };
  }

  it('renders the routed page inside the main area', async () => {
    const { el, go } = await setup();
    await go('/nova');
    expect(el.querySelector('main .page')?.textContent).toBe('nova');
  });

  it('renders every menu item as a link', async () => {
    const { el, go } = await setup();
    await go('/nova');
    const links = Array.from(el.querySelectorAll('nav[aria-label="Menu principal"] a'));
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/home', '/planejamentos', '/adicionar-gastos', '/inventario', '/sobre']);
  });

  it('shows the route title in the navbar and in the browser tab', async () => {
    const { el, go } = await setup();
    await go('/nova');
    expect(el.querySelector('header h1')!.textContent!.trim()).toBe('Nova');
    expect(TestBed.inject(Title).getTitle()).toBe('Nova · Minhas Finanças');
  });


  it('closes the mobile drawer after navigating', async () => {
    const { el, go, fixture } = await setup();
    const toggle = el.querySelector<HTMLInputElement>('#app-drawer')!;

    toggle.click();
    fixture.detectChanges();
    expect(toggle.checked).toBeTrue();

    await go('/nova');
    expect(toggle.checked).toBeFalse();
  });
});
