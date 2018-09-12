import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimTermsComponent } from './claim-terms.component';

describe('ClaimTermsComponent', () => {
  let component: ClaimTermsComponent;
  let fixture: ComponentFixture<ClaimTermsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimTermsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimTermsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
