import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancellationServiceCategoryComponent } from './cancellation-service-category.component';

describe('CancellationServiceCategoryComponent', () => {
  let component: CancellationServiceCategoryComponent;
  let fixture: ComponentFixture<CancellationServiceCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancellationServiceCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancellationServiceCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
