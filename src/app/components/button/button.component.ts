import {Component, Input} from '@angular/core';
import {faPoo} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent, IconDefinition} from "@fortawesome/angular-fontawesome";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    FaIconComponent,
    RouterLink
  ],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() icon: IconDefinition | null = faPoo;
  @Input() label: string | null = null;
}
