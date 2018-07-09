import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosDatosComponent } from './pagos-datos.component';

describe('PagosDatosComponent', () => {
  let component: PagosDatosComponent;
  let fixture: ComponentFixture<PagosDatosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagosDatosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagosDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
