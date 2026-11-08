import { TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { THEME_STORAGE_KEY, ThemeService } from '../../core/theme/theme.service';

describe('ThemeToggleComponent', () => {
  beforeEach(() => localStorage.removeItem(THEME_STORAGE_KEY));
  afterAll(() => localStorage.removeItem(THEME_STORAGE_KEY));

  it('toggles the theme and updates its accessible label', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(button.getAttribute('aria-label')).toBe('Ativar tema claro');
    button.click();
    fixture.detectChanges();

    expect(TestBed.inject(ThemeService).theme()).toBe('emerald');
    expect(button.getAttribute('aria-label')).toBe('Ativar tema escuro');
    expect(button.classList).toContain('swap-active');
  });
});
