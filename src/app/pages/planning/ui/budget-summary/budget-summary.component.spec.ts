import { TestBed } from '@angular/core/testing';
import { provideTestDefaults } from '../../../../testing/test-providers';
import { BudgetSummaryComponent } from './budget-summary.component';

describe('BudgetSummaryComponent', () => {
  function render(planned: number, spent: number): HTMLElement {
    TestBed.configureTestingModule({ providers: [provideTestDefaults()] });
    const fixture = TestBed.createComponent(BudgetSummaryComponent);
    fixture.componentRef.setInput('title', 'Contas');
    fixture.componentRef.setInput('planned', planned);
    fixture.componentRef.setInput('spent', spent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  /** O pipe currency usa espaço não separável entre "R$" e o número. */
  const text = (el: HTMLElement) => el.textContent!.replace(/\u00a0/g, ' ');

  it('shows the remaining amount and the ok status when within budget', () => {
    const el = render(1000, 500);
    expect(text(el)).toContain('Restante');
    expect(text(el)).toContain('R$ 500,00');
    expect(el.querySelector('.badge')!.classList).toContain('badge-success');
    expect(text(el)).toContain('50% utilizado');
  });

  it('shows the excess and the over status when the budget is exceeded', () => {
    const el = render(1000, 1250);
    expect(text(el)).toContain('Excedente');
    expect(text(el)).toContain('R$ 250,00');
    expect(el.querySelector('.badge')!.classList).toContain('badge-error');
    expect(el.querySelector('progress')!.getAttribute('value')).toBe('100');
  });
});
