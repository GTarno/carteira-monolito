import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Rodapé do layout, exibido em todas as páginas. */
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  protected readonly year = 2026;
}
