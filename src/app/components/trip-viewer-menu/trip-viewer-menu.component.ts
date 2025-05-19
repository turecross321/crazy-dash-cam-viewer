import { Component } from '@angular/core';
import {MenuComponent} from "../menu/menu.component";
import {MenuButtonComponent} from "../menu-button/menu-button.component";
import {faPen, faTrashCan} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-trip-viewer-menu',
  standalone: true,
  imports: [
    MenuComponent,
    MenuButtonComponent
  ],
  templateUrl: './trip-viewer-menu.component.html'
})
export class TripViewerMenuComponent {

  protected readonly faPen = faPen;
  protected readonly faTrashCan = faTrashCan;
}
