import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { MenuService } from '../../core/services/menu.service';
import { APP_NAME } from '../../core/routing/page-title.strategy';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

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

  /** Título da rota ativa (o mais específico entre as rotas aninhadas). */
  protected readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => {
        this.drawerOpen.set(false);
        return this.readPageTitle();
      })
    ),
    { initialValue: this.readPageTitle() }
  );

  protected onDrawerToggle(event: Event): void {
    this.drawerOpen.set((event.target as HTMLInputElement).checked);
  }

  private readPageTitle(): string {
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let title = '';
    while (route) {
      title = route.title ?? title;
      route = route.firstChild;
    }
    return title;
  }
}
