import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMeterReadingComponent } from './report-meter-reading.component';

describe('ReportMeterReadingComponent', () => {
  let component: ReportMeterReadingComponent;
  let fixture: ComponentFixture<ReportMeterReadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportMeterReadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMeterReadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
