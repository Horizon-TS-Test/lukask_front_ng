import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonModallearComponent } from './horizon-modallear.component';

describe('HorizonModallearComponent', () => {
  let component: HorizonModallearComponent;
  let fixture: ComponentFixture<HorizonModallearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizonModallearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizonModallearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
