import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';

/** Página para endereços que não existem. */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, IconComponent],
  template: `
    <section class="card mx-auto max-w-lg bg-base-100 shadow-sm">
      <div class="card-body items-center gap-4 py-14 text-center">
        <span class="rounded-box bg-primary/15 p-3 text-primary"><app-icon name="info" [size]="36" /></span>
        <p class="text-5xl font-bold tabular-nums">404</p>
        <h2 class="text-xl font-semibold">Página não encontrada</h2>
        <p class="text-base-content/80">
          O endereço <code class="rounded bg-base-200 px-1.5 py-0.5 text-sm break-all">{{ url }}</code> não existe neste app.
        </p>
        <a routerLink="/home" class="btn btn-primary"><app-icon name="dashboard" [size]="18" /> Ir para o início</a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundPage {
  protected readonly url = inject(Router).url;
}
