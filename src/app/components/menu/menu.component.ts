import { Component } from '@angular/core';
import {ButtonComponent} from "../button/button.component";
import {MenuButtonComponent} from "../menu-button/menu-button.component";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    ButtonComponent,
    MenuButtonComponent
  ],
  templateUrl: './menu.component.html'
})
export class MenuComponent {

}
