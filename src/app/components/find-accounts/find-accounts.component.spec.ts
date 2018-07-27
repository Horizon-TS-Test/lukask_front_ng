import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindAccountsComponent } from './find-accounts.component';

describe('FindAccountsComponent', () => {
  let component: FindAccountsComponent;
  let fixture: ComponentFixture<FindAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
