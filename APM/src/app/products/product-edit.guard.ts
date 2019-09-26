import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

import { ProductEditComponent } from './product-edit.component';

@Injectable({
  providedIn: 'root'
})
export class ProductEditGuard implements CanDeactivate<ProductEditComponent> {
  // pass in a Component that will use this guard as a parameter
  canDeactivate(component: ProductEditComponent): Observable<boolean> | Promise<boolean> | boolean {
    // if any form element is dirty
    if (component.productForm.dirty) {
      // if productName value is null, return as New Product 
      const productName = component.productForm.get('productName').value || 'New Product';
      return confirm(`Navigate away and lose all changes to ${productName}?`);
    }
    return true;
  }
}
