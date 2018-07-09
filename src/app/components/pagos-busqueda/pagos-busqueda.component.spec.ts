import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosBusquedaComponent } from './pagos-busqueda.component';

describe('PagosBusquedaComponent', () => {
  let component: PagosBusquedaComponent;
  let fixture: ComponentFixture<PagosBusquedaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagosBusquedaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagosBusquedaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
