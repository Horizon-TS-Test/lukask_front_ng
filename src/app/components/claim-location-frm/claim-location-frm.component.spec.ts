import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimLocationFrmComponent } from './claim-location-frm.component';

describe('ClaimLocationFrmComponent', () => {
  let component: ClaimLocationFrmComponent;
  let fixture: ComponentFixture<ClaimLocationFrmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimLocationFrmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimLocationFrmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
