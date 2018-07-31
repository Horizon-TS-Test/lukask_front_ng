import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosInicioComponent } from './pagos-inicio.component';

describe('PagosInicioComponent', () => {
  let component: PagosInicioComponent;
  let fixture: ComponentFixture<PagosInicioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagosInicioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PagosInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
