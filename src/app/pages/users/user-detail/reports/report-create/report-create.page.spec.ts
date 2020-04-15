import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReportCreatePage } from './report-create.page';

describe('ReportCreatePage', () => {
  let component: ReportCreatePage;
  let fixture: ComponentFixture<ReportCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportCreatePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
