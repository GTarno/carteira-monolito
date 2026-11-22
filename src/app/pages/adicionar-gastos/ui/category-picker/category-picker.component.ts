import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PlanningCategory } from '../../../planning/data-access/planning.mock';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

let nextId = 0;

/**
 * Escolha da categoria do planejamento em cards com ícone (radio buttons acessíveis).
 * Funciona como campo de formulário: `<app-category-picker formControlName="categoryId" [categories]="..." />`.
 */
@Component({
  selector: 'app-category-picker',
  imports: [IconComponent],
  template: `
    <div class="grid gap-2 sm:grid-cols-2">
      @for (category of categories(); track category.id) {
        <label
          class="flex cursor-pointer items-center gap-3 rounded-box border px-3 py-3 transition hover:bg-base-200"
          [class]="value() === category.id ? 'border-primary bg-primary/10' : 'border-base-300'">
          <input
            type="radio"
            class="radio radio-primary radio-sm"
            [name]="name"
            [value]="category.id"
            [checked]="value() === category.id"
            [disabled]="disabled()"
            (change)="select(category.id)"
            (blur)="onTouched()" />
          <app-icon [name]="category.icon" [size]="20" />
          <span class="font-medium">{{ category.title }}</span>
        </label>
      }
    </div>
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CategoryPickerComponent), multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryPickerComponent implements ControlValueAccessor {
  readonly categories = input.required<PlanningCategory[]>();

  protected readonly name = `category-picker-${nextId++}`;
  protected readonly value = signal<string>('');
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected select(id: string): void {
    this.value.set(id);
    this.onChange(id);
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
