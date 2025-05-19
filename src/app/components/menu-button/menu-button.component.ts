import {Component, Input} from '@angular/core';
import {FaIconComponent, IconDefinition} from "@fortawesome/angular-fontawesome";
import {faPoo} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-menu-button',
  standalone: true,
  imports: [
    FaIconComponent
  ],
  templateUrl: './menu-button.component.html',
})
export class MenuButtonComponent {
  @Input() icon: IconDefinition = faPoo;
  @Input() label: string | null = null;
}
