import { TestBed } from '@angular/core/testing';
import { DEFAULT_THEME, THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  const html = document.documentElement;

  beforeEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    html.removeAttribute('data-theme');
    TestBed.resetTestingModule();
  });

  afterAll(() => localStorage.removeItem(THEME_STORAGE_KEY));

  function create(): ThemeService {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    return service;
  }

  it('starts with forest (dark) and applies it to <html>', () => {
    const service = create();
    expect(service.theme()).toBe(DEFAULT_THEME);
    expect(service.isDark()).toBeTrue();
    expect(html.getAttribute('data-theme')).toBe('forest');
  });

  it('toggles between forest and emerald and persists the choice', () => {
    const service = create();
    service.toggle();
    TestBed.tick();

    expect(service.theme()).toBe('emerald');
    expect(service.isDark()).toBeFalse();
    expect(html.getAttribute('data-theme')).toBe('emerald');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('emerald');
  });

  it('restores a stored theme and ignores invalid values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'emerald');
    expect(create().theme()).toBe('emerald');

    TestBed.resetTestingModule();
    localStorage.setItem(THEME_STORAGE_KEY, 'not-a-theme');
    expect(create().theme()).toBe(DEFAULT_THEME);
  });
});
