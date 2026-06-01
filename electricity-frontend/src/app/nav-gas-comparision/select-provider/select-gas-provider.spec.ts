import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectGasProvider } from './select-gas-provider';

describe('SelectGasProvider', () => {
  let component: SelectGasProvider;
  let fixture: ComponentFixture<SelectGasProvider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectGasProvider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectGasProvider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
