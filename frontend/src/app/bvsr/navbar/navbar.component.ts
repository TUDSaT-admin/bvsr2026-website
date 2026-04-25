import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AppLang, I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatToolbarModule, MatIconModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuOpen = false;

  constructor(readonly i18n: I18nService) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onLang(lang: AppLang): void {
    void this.i18n.setLang(lang);
  }
}
