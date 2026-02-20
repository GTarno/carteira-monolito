import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, combineLatest, map, shareReplay, startWith } from 'rxjs';
import { MenuItem, MENU_ITEMS } from '../../../models/menu-item';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);

  menuItems: MenuItem[] = MENU_ITEMS;

  // Observes se está em modo mobile
  isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset])
    .pipe(
      map(result => result.matches),
      startWith(false),
      shareReplay(1)
    );

  // Modo do sidenav baseado no breakpoint
  sidenavMode$: Observable<'side' | 'over'> = this.isMobile$.pipe(
    map(isMobile => isMobile ? 'over' : 'side'),
    shareReplay(1)
  );

  // Se deve estar aberto por padrão - sempre fechado
  opened$: Observable<boolean> = this.isMobile$.pipe(
    map(isMobile => false),
    shareReplay(1)
  );

  // Para controlar o backdrop
  hasBackdrop$: Observable<boolean> = this.isMobile$.pipe(
    shareReplay(1)
  );

  // Funcao para fechar sidenav no mobile ao navegar
  onNavigate(route: string): void {
    this.router.navigate([route]);
    
    // No mobile, fecha o sidenav após navegar
    this.isMobile$.pipe(
      map(isMobile => {
        if (isMobile) {
          // Pequeno delay para melhor UX
          setTimeout(() => {
            const sidenav = document.querySelector('mat-sidenav') as any;
            if (sidenav && sidenav._animationStarted === false) {
              sidenav.close();
            }
          }, 100);
        }
      })
    ).subscribe();
  }
}
