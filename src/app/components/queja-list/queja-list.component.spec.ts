import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuejaListComponent } from './queja-list.component';

describe('QuejaListComponent', () => {
  let component: QuejaListComponent;
  let fixture: ComponentFixture<QuejaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuejaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuejaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
