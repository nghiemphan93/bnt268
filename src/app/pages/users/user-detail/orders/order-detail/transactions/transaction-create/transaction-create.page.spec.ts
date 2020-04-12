import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TransactionCreatePage } from './transaction-create.page';

describe('TransactionCreatePage', () => {
  let component: TransactionCreatePage;
  let fixture: ComponentFixture<TransactionCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionCreatePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
