import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PlanningService } from './planning.service';
import { YearMonthUtils } from '../models/year-month.models';
import { PLANNING_FUTURE_MONTHS, PLANNING_HISTORY_MONTHS } from './planning.mock';

describe('PlanningService (in-memory)', () => {
  let service: PlanningService;
  const current = YearMonthUtils.getCurrentYearMonth();

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanningService);
  });

  it('offers months around the current month, newest first', async () => {
    const months = await firstValueFrom(service.getAvailableMonths());
    expect(months.length).toBe(PLANNING_HISTORY_MONTHS + PLANNING_FUTURE_MONTHS + 1);
    expect(months[0]).toEqual(YearMonthUtils.addMonths(current, PLANNING_FUTURE_MONTHS));
    expect(months).toContain(jasmine.objectContaining(current));
  });

  it('derives card totals from the category items', async () => {
    const plan = await firstValueFrom(service.getMonthlyPlan(current));
    const items = await firstValueFrom(service.getItemsByCategory(current, 'contas'));
    const card = plan.cards.find(c => c.id === 'contas')!;

    expect(card.plannedValue).toBeCloseTo(items.reduce((s, i) => s + i.plannedValue, 0), 2);
    expect(card.currentValue!).toBeCloseTo(items.reduce((s, i) => s + i.realValue, 0), 2);
  });

  it('reflects item updates in the monthly plan and notifies listeners', async () => {
    const changes: string[] = [];
    service.itemsChanged$.subscribe(change => changes.push(change.categoryId));

    await firstValueFrom(service.updateItemValues(current, 'contas', 'luz', { plannedValue: 1000, realValue: 999 }));
    const plan = await firstValueFrom(service.getMonthlyPlan(current));
    const card = plan.cards.find(c => c.id === 'contas')!;

    expect(card.items!.find(i => i.name === 'Luz')!.value).toBe(999);
    expect(changes).toEqual(['contas']);
  });

  it('includes newly added items in the card totals', async () => {
    const before = (await firstValueFrom(service.getMonthlyPlan(current))).cards.find(c => c.id === 'alimentacao')!;
    await firstValueFrom(service.addCategoryItem(current, {
      categoryId: 'alimentacao', name: 'Padaria', plannedValue: 150, icon: 'bakery_dining'
    }));
    const after = (await firstValueFrom(service.getMonthlyPlan(current))).cards.find(c => c.id === 'alimentacao')!;

    expect(after.plannedValue).toBeCloseTo(before.plannedValue + 150, 2);
  });

  it('builds a 12-month trend ending at the requested month', async () => {
    const trend = await firstValueFrom(service.getItemTrend('contas', 'condominio', current));
    expect(trend.length).toBe(12);
    expect(trend[trend.length - 1].month).toBe(YearMonthUtils.toKey(current));
  });
});
