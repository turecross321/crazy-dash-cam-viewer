import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective {

  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {
  }

  private isHidden(el: HTMLElement | null): boolean {
    while (el) {
      const style = getComputedStyle(el);
      if (style.display === 'none') {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement) {
    const el = this.elementRef.nativeElement as HTMLElement;

    if (this.isHidden(el)) {
      return; // Skip emitting if element or a parent is hidden
    }

    const clickedInside = el.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
