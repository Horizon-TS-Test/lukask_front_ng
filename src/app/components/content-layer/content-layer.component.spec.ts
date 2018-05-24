import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentLayerComponent } from './content-layer.component';

describe('ContentLayerComponent', () => {
  let component: ContentLayerComponent;
  let fixture: ComponentFixture<ContentLayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
