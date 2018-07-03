import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonNotificationComponent } from './horizon-notification.component';

describe('HorizonNotificationComponent', () => {
  let component: HorizonNotificationComponent;
  let fixture: ComponentFixture<HorizonNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizonNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizonNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
