import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInvoiceRequestComponent } from './customer-invoice-request.component';

describe('CustomerInvoiceRequestComponent', () => {
  let component: CustomerInvoiceRequestComponent;
  let fixture: ComponentFixture<CustomerInvoiceRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerInvoiceRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerInvoiceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
