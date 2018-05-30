import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizonModalComponent } from './horizon-modal.component';

describe('HorizonModalComponent', () => {
  let component: HorizonModalComponent;
  let fixture: ComponentFixture<HorizonModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizonModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
