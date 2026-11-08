import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { AppDialog } from './app-dialog.service';

@Component({
  template: `
    <h3 class="text-lg font-bold">{{ data.title }}</h3>
    <button type="button" class="btn" (click)="ref.close('ok')">OK</button>
  `
})
class TestDialogComponent {
  readonly data = inject<{ title: string }>(DIALOG_DATA);
  readonly ref = inject<DialogRef<string>>(DialogRef);
}

describe('AppDialog', () => {
  afterEach(() => TestBed.inject(AppDialog).closeAll());

  it('opens a component in a themed panel with data and returns the result', fakeAsync(() => {
    const dialog = TestBed.inject(AppDialog);
    let result: string | undefined;

    const ref = dialog.open<TestDialogComponent, { title: string }, string>(TestDialogComponent, {
      data: { title: 'Editar item' }
    });
    ref.closed.subscribe(value => (result = value));
    flush();

    const panel = document.querySelector('.app-dialog-panel') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.textContent).toContain('Editar item');
    expect(document.querySelector('.app-dialog-backdrop')).toBeTruthy();

    (panel.querySelector('button') as HTMLButtonElement).click();
    flush();
    expect(result).toBe('ok');
    expect(document.querySelector('.app-dialog-panel')).toBeNull();
  }));
});
