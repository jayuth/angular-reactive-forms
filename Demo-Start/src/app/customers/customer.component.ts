import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Customer } from './customer';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  // data model
  customer = new Customer();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    // Form Model tracks form values and states 
    this.customerForm = this.fb.group({
      // a set of FormControl in key-value pair format 
      firstName: '',
      lastName: '',
      email: '',
      // set a default value of sendCatalog to true
      sendCatalog: true
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
}
