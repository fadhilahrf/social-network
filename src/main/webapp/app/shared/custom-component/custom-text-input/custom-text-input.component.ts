import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'custom-text-input',
  standalone: true,
  imports: [],
  templateUrl: './custom-text-input.component.html',
  styleUrl: './custom-text-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomTextInputComponent),
      multi: true
    }
  ]
})
export class CustomTextInputComponent implements ControlValueAccessor {
  @ViewChild('customTextInput', { static: true }) customInput!: ElementRef<HTMLElement>;
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  @Input() placeholder: string = '';

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: any): void {
    this.value = value;
    this.customInput.nativeElement.textContent = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    this.value = event.target.textContent;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouch();
  }
}
