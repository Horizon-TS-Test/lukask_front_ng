import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnavaliableComponent } from './unavaliable.component';

describe('UnavaliableComponent', () => {
  let component: UnavaliableComponent;
  let fixture: ComponentFixture<UnavaliableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnavaliableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnavaliableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
