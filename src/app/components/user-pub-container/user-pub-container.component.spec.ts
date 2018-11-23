import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPubContainerComponent } from './user-pub-container.component';

describe('UserPubContainerComponent', () => {
  let component: UserPubContainerComponent;
  let fixture: ComponentFixture<UserPubContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPubContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPubContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
