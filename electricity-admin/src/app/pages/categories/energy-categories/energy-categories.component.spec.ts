import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyCategoriesComponent } from './energy-categories.component';

describe('EnergyCategoriesComponent', () => {
  let component: EnergyCategoriesComponent;
  let fixture: ComponentFixture<EnergyCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnergyCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnergyCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
