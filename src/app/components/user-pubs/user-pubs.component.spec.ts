import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPubsComponent } from './user-pubs.component';

describe('UserPubsComponent', () => {
  let component: UserPubsComponent;
  let fixture: ComponentFixture<UserPubsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPubsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
