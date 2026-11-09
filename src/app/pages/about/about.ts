import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAME } from '../../core/routing/page-title.strategy';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { AppIconName } from '../../shared/ui/icon/app-icons';

interface Feature {
  icon: AppIconName;
  title: string;
  description: string;
}

/** Página "Sobre": o que o app faz, tecnologias e o projeto de TCC. */
@Component({
  selector: 'app-about',
  imports: [RouterLink, IconComponent],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class About {
  readonly appName = APP_NAME;
  readonly version = '1.0.0';
  readonly description = 'Gestão financeira pessoal: planeje, acompanhe e organize seus gastos.';

  readonly features: Feature[] = [
    { icon: 'dashboard', title: 'Painel', description: 'Gastos por categoria, mês a mês e tendência semanal em gráficos.' },
    { icon: 'wallet', title: 'Planejamento mensal', description: 'Defina quanto pretende gastar em cada categoria e acompanhe o que já foi usado.' },
    { icon: 'add-expense', title: 'Registro de gastos', description: 'Lance contas mensais e compras parceladas.' },
    { icon: 'receipt', title: 'Contas do mês', description: 'Marque as contas pagas e veja o que ainda vence.' },
    { icon: 'credit-card', title: 'Parcelamentos', description: 'Acompanhe as parcelas pagas e quanto falta de cada compra.' },
    { icon: 'inventory', title: 'Inventário pessoal', description: 'Organize coleções como livros e discos.' }
  ];

  readonly techStack = [
    { name: 'Angular', version: '20', description: 'Framework da aplicação' },
    { name: 'Tailwind CSS', version: '4', description: 'Estilos utilitários' },
    { name: 'DaisyUI', version: '5', description: 'Componentes e temas (forest/emerald)' },
    { name: 'Chart.js', version: '4', description: 'Gráficos' },
    { name: 'Lucide', description: 'Ícones' },
    { name: 'TypeScript', version: '5.9', description: 'Linguagem' }
  ];

  readonly project = {
    author: 'Giovanna Tarno',
    institution: 'Fatec Zona Leste',
    period: '1º semestre de 2026'
  };
}
