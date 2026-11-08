import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';
import { APP_ICONS, isAppIconName } from './app-icons';

@Component({
  imports: [IconComponent],
  template: `<app-icon [name]="name()" [label]="label()" [size]="16" />`
})
class HostComponent {
  name = signal('wallet');
  label = signal<string | undefined>(undefined);
}

describe('IconComponent', () => {
  function render(name: string, label?: string): HTMLElement {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.name.set(name);
    fixture.componentInstance.label.set(label);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('app-icon');
  }

  it('renders the Lucide svg for a registered name', () => {
    const host = render('wallet');
    const svg = host.querySelector('svg')!;
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.querySelectorAll('path, rect, circle, line, polyline').length).toBeGreaterThan(0);
  });

  it('is decorative without a label and accessible with one', () => {
    expect(render('wallet').getAttribute('aria-hidden')).toBe('true');

    const labelled = render('delete', 'Excluir');
    expect(labelled.getAttribute('aria-hidden')).toBeNull();
    expect(labelled.getAttribute('role')).toBe('img');
    expect(labelled.getAttribute('aria-label')).toBe('Excluir');
  });

  it('falls back to the default icon for unknown names', () => {
    const svg = render('nao-existe').querySelector('svg')!;
    expect(svg.querySelectorAll('path, circle, line').length).toBeGreaterThan(0);
  });

  it('only registers icons with drawing data', () => {
    for (const [name, icon] of Object.entries(APP_ICONS)) {
      expect(isAppIconName(name)).toBeTrue();
      expect(icon.node.length).withContext(name).toBeGreaterThan(0);
    }
  });
});
