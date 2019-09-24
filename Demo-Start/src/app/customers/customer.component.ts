import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';

import { Customer } from './customer';

// custom validator with paramerter 
function ratingRange(min: number, max: number): ValidatorFn{
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    // c = control
    if(c.value !== null && (isNaN(c.value)) || c.value < 1 || c.value > 5){
      // return a key value pair if the cobtroller is invalid
      return {'range': true};
    }
    // return null if the control is valid
    return null;
  };
}

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  // extract a value from each FormControl name
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');

  // wait until the user finished filling both email and confirmEmail before performing validation
  if(emailControl.pristine || confirmControl.pristine){
    return null;
  }

  if(emailControl.value === confirmControl.value){
    return null;
  }
  return { 'match': true };
} 

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})

export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  // data model
  customer = new Customer();
  emailMessage: string;

  private validationMessages = {
    // key-value pair validation rule name
    // the key name matches the key in error object collection so we can map this value to the key in error collection
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    // Form Model tracks form values and states 
    this.customerForm = this.fb.group({
      // a set of FormControl in key-value pair format 
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      // nested FormGroup
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', Validators.required],
        }, {validator: emailMatcher}),
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5)],
      // set a default value of sendCatalog to true
      sendCatalog: true,
      addressType: 'home',
      street1: '',
      street2: ''
    });
    
    // call FormControl from the FormGroup
    // track value changes in notification FormControl right after the component is initialised
    this.customerForm.get('notification').valueChanges.subscribe(
      value => this.setNotification(value)
    );

    const emailControl = this.customerForm.get('emailGroup.email');
    // asynchronous - value passes in as the user types
    emailControl.valueChanges.pipe(
      debounceTime(1000)
      ).subscribe(
      // each character will make a call this method
      value => this.setMessage(emailControl)
    );
  }

  populateTestData(): void {
    this.customerForm.patchValue({
      firstName: 'Jay',
      lastName: 'Uthairat',
      email: 'j.uth@comp.com'
      // sendCatalog: false
    });
  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  // AbstractControl is a value entered in an email input field (emailGroup.email)
  setMessage(c: AbstractControl): void {
    console.log(this.customerForm.get('emailGroup.email'));
    this.emailMessage = '';
    // check if the user modifies the field and entered input doesn't meet defined conditions
    if((c.touched || c.dirty) && c.errors){
      this.emailMessage = Object.keys(c.errors).map(
        key => this.validationMessages[key]).join(' ');
    }
  }

  // this method is for a checkbox. 
  setNotification(notifyVia: string): void {
    // find a phone input field/formControlName in the template using the 'get' method
    // this way, we can access to the phone FormControl and set a validator to it
    const phoneControl = this.customerForm.get('phone');
    if(notifyVia === 'text'){
      phoneControl.setValidators(Validators.required);
    } else{
      phoneControl.clearValidators();
    }
    // after setting or clearing the validators, we need to re-evaluate phone FormControl's validation state
    phoneControl.updateValueAndValidity();   
  }
}
