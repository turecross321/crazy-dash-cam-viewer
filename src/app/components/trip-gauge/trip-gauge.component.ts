import {Component, Input} from '@angular/core';
import {faPoo, faTemperature0} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent, IconDefinition} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-trip-gauge',
  standalone: true,
  imports: [
    FaIconComponent
  ],
  templateUrl: './trip-gauge.component.html',
})
export class TripGaugeComponent {

  @Input() icon: IconDefinition = faPoo;
  @Input() label: string | undefined = undefined;
  @Input() value: any | undefined;
  @Input() unit: string = "hamburgers";
}
