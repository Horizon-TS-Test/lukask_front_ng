import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallSliderComponent } from './install-slider.component';

describe('InstallSliderComponent', () => {
  let component: InstallSliderComponent;
  let fixture: ComponentFixture<InstallSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstallSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
