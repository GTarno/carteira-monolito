import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

/** Saudação e saldo do usuário (dados de exemplo até existir login/API). */
@Component({
  selector: 'app-persona',
  imports: [CurrencyPipe, IconComponent],
  templateUrl: './persona.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonaComponent {
  // Dados mockados da persona
  readonly persona = {
    nome: 'João Silva',
    cargo: 'Analista de Sistemas',
    valorEmCaixa: 2500.75
  };
}
