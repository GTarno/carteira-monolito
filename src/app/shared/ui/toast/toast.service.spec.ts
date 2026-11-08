import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { ToastOutletComponent } from './toast-outlet.component';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = TestBed.inject(ToastService);
  });

  it('shows a toast and dismisses it after its duration', fakeAsync(() => {
    service.success('Salvo!', { duration: 1000 });
    expect(service.toasts().map(t => t.message)).toEqual(['Salvo!']);

    tick(999);
    expect(service.toasts().length).toBe(1);
    tick(1);
    expect(service.toasts().length).toBe(0);
  }));

  it('keeps toasts with duration 0 until dismissed', fakeAsync(() => {
    const id = service.error('Falhou', { duration: 0 });
    tick(60_000);
    expect(service.toasts().length).toBe(1);

    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  }));

  it('limits the number of visible toasts, dropping the oldest', fakeAsync(() => {
    for (let i = 1; i <= 6; i++) service.info(`m${i}`, { duration: 0 });
    expect(service.toasts().map(t => t.message)).toEqual(['m3', 'm4', 'm5', 'm6']);
  }));
});

describe('ToastOutletComponent', () => {
  it('renders toasts with the matching DaisyUI alert style and closes on click', fakeAsync(() => {
    const fixture = TestBed.createComponent(ToastOutletComponent);
    const service = TestBed.inject(ToastService);

    service.warning('Atenção', { duration: 0 });
    fixture.detectChanges();

    const alert: HTMLElement = fixture.nativeElement.querySelector('.alert');
    expect(alert.textContent).toContain('Atenção');
    expect(alert.classList).toContain('alert-warning');

    alert.querySelector('button')!.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert')).toBeNull();
  }));
});
