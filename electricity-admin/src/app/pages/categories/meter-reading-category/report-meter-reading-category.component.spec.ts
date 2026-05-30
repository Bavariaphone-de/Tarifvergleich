import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ReportMeterReadingCategoryComponent } from "./report-meter-reading-category.component";

describe("ReportMeterReadingCategoryComponent", () => {
  let component: ReportMeterReadingCategoryComponent;
  let fixture: ComponentFixture<ReportMeterReadingCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportMeterReadingCategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportMeterReadingCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
