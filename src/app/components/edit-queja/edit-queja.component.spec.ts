import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditQuejaComponent } from './edit-queja.component';

describe('EditQuejaComponent', () => {
  let component: EditQuejaComponent;
  let fixture: ComponentFixture<EditQuejaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditQuejaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditQuejaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
