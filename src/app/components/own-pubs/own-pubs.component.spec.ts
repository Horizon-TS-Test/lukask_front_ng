import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnPubsComponent } from './own-pubs.component';

describe('OwnPubsComponent', () => {
  let component: OwnPubsComponent;
  let fixture: ComponentFixture<OwnPubsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OwnPubsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnPubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
