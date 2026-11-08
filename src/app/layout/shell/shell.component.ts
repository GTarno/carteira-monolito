import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { MenuService } from '../../core/services/menu.service';
import { APP_NAME } from '../../core/routing/page-title.strategy';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

interface ActivePage {
  title: string;
  /** Página ainda não migrada para o DaisyUI (ver `data.legacyUi` nas rotas). */
  legacyUi: boolean;
}

/**
 * Layout do app: menu lateral (drawer) + barra superior + conteúdo + rodapé.
 * No desktop (lg) o menu fica fixo; no celular ele desliza e fecha ao navegar.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, FooterComponent, ThemeToggleComponent],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
  private readonly router = inject(Router);

  protected readonly appName = APP_NAME;
  protected readonly menuItems = inject(MenuService).getMenuItems();

  /** Estado do menu no celular (no desktop ele fica sempre aberto via `lg:drawer-open`). */
  protected readonly drawerOpen = signal(false);

  private readonly activePage = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => {
        this.drawerOpen.set(false);
        return this.readActivePage();
      })
    ),
    { initialValue: this.readActivePage() }
  );

  protected readonly pageTitle = computed(() => this.activePage().title);
  protected readonly legacyUi = computed(() => this.activePage().legacyUi);

  protected onDrawerToggle(event: Event): void {
    this.drawerOpen.set((event.target as HTMLInputElement).checked);
  }

  private readActivePage(): ActivePage {
    let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    let title = '';
    let legacyUi = false;
    for (;;) {
      title = route.title ?? title;
      legacyUi = route.data['legacyUi'] === true || legacyUi;
      if (!route.firstChild) break;
      route = route.firstChild;
    }
    return { title, legacyUi };
  }
}
