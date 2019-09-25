import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';

import { Customer } from './customer';

// custom validator with paramerter 
/*
function ratingRange(min: number, max: number): ValidatorFn{
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    // the default value of rating is 'null'. If the value is null then skip validation
    // here we check if there is any entered input which is equal to this condition; c.value !== null 
    if(c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)){
      console.log(c.value);
      // return a key value pair if the cobtroller is invalid
      return {'range': true};
    }
    // return null if the control is valid
    return null;
  };
}
*/
function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)) {
      console.log(c.value);
      return { 'range': true };
    }
    return null;
  };
}

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  // extract a value from each FormControl name
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');

  // return valid if bot forms hasn't been touched yet
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

  // use a getter property here to prevent other code accidentally modify address instances
  get addresses(): FormArray{
    // this will return FormArray from address FormControl
    // <FormArray> is a type that we want to cast to
    return <FormArray>this.customerForm.get('addresses');
  }

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
      // allow user to enter multiple addresses. We use FormArray to hold address instances 
      // we create one instance for an address
      addresses: this.fb.array([ this.buildAddress() ]) 
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

  // create an instance of an address block FormGroup
  buildAddress(): FormGroup {
    return this.fb.group({
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    })
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

  // when the user clicks add button, another new address instance will be created
  addAddress(): void{
    // this will call the getter method and push new address instance to FormArray
    this.addresses.push(this.buildAddress());
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
