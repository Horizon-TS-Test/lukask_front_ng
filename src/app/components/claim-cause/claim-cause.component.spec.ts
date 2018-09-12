import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimCauseComponent } from './claim-cause.component';

describe('ClaimCauseComponent', () => {
  let component: ClaimCauseComponent;
  let fixture: ComponentFixture<ClaimCauseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimCauseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimCauseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
