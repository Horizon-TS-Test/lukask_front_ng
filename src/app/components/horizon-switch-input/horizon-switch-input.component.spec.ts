import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonSwitchInputComponent } from './horizon-switch-input.component';

describe('HorizonSwitchInputComponent', () => {
  let component: HorizonSwitchInputComponent;
  let fixture: ComponentFixture<HorizonSwitchInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizonSwitchInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizonSwitchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
