import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanillaDetailComponent } from './planilla-detail.component';

describe('PlanillaDetailComponent', () => {
  let component: PlanillaDetailComponent;
  let fixture: ComponentFixture<PlanillaDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlanillaDetailComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanillaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
