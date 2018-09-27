import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonSwitchInListComponent } from './horizon-switch-in-list.component';

describe('HorizonSwitchInListComponent', () => {
  let component: HorizonSwitchInListComponent;
  let fixture: ComponentFixture<HorizonSwitchInListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizonSwitchInListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizonSwitchInListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
