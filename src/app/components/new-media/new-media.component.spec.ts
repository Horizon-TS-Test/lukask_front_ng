import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMediaComponent } from './new-media.component';

describe('NewMediaComponent', () => {
  let component: NewMediaComponent;
  let fixture: ComponentFixture<NewMediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewMediaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
