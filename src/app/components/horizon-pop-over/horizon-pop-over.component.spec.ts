import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonPopOverComponent } from './horizon-pop-over.component';

describe('HorizonPopOverComponent', () => {
  let component: HorizonPopOverComponent;
  let fixture: ComponentFixture<HorizonPopOverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizonPopOverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizonPopOverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
