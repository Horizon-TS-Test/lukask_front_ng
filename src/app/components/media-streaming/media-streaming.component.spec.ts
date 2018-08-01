import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaStreamingComponent } from './media-streaming.component';

describe('MediaStreamingComponent', () => {
  let component: MediaStreamingComponent;
  let fixture: ComponentFixture<MediaStreamingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaStreamingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaStreamingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
