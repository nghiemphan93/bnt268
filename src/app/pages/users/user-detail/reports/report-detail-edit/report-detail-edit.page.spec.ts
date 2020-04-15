import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReportDetailEditPage } from './report-detail-edit.page';

describe('ReportDetailEditPage', () => {
  let component: ReportDetailEditPage;
  let fixture: ComponentFixture<ReportDetailEditPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportDetailEditPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportDetailEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
