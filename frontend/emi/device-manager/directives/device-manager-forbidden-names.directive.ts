// equal-validator.directive.ts

import { Directive, forwardRef, Attribute } from "@angular/core";
import { Validator, AbstractControl, NG_VALIDATORS } from "@angular/forms";
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: "[validateforbiddenNames][formControlName],[validateforbiddenNames][formControl],[validateforbiddenNames][ngModel]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ForbiddenNamesValidator),
      multi: true
    }
  ]
})

export class ForbiddenNamesValidator implements Validator {
  constructor(@Attribute("validateforbiddenNames") public validateforbiddenNames: any) {}

  validate(control: AbstractControl): { [key: string]: any } {
    const index = this.validateforbiddenNames.filter(e => e === control.value);
    if (control.value) {
      return {
        validateforbiddenNames: false
      };
    }
    return null;
  }
}
