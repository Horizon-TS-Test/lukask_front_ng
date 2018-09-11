import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimEersaComponent } from './claim-eersa.component';

describe('ClaimEersaComponent', () => {
  let component: ClaimEersaComponent;
  let fixture: ComponentFixture<ClaimEersaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimEersaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimEersaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
