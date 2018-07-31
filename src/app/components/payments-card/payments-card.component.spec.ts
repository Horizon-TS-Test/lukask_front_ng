import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsCardComponent } from './payments-card.component';

describe('PaymentsCardComponent', () => {
  let component: PaymentsCardComponent;
  let fixture: ComponentFixture<PaymentsCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
