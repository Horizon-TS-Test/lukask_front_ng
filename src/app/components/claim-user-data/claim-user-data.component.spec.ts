import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimUserDataComponent } from './claim-user-data.component';

describe('ClaimUserDataComponent', () => {
  let component: ClaimUserDataComponent;
  let fixture: ComponentFixture<ClaimUserDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimUserDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimUserDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
