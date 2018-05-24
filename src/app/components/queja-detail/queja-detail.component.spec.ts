import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuejaDetailComponent } from './queja-detail.component';

describe('QuejaDetailComponent', () => {
  let component: QuejaDetailComponent;
  let fixture: ComponentFixture<QuejaDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuejaDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuejaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
