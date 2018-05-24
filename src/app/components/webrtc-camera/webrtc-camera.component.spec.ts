import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebrtcCameraComponent } from './webrtc-camera.component';

describe('WebrtcCameraComponent', () => {
  let component: WebrtcCameraComponent;
  let fixture: ComponentFixture<WebrtcCameraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebrtcCameraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebrtcCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
