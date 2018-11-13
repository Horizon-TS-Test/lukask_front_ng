import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnpubContainerComponent } from './ownpub-container.component';

describe('OwnpubContainerComponent', () => {
  let component: OwnpubContainerComponent;
  let fixture: ComponentFixture<OwnpubContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OwnpubContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnpubContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
