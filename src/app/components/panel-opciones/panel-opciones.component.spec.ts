import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelOpcionesComponent } from './panel-opciones.component';

describe('PanelOpcionesComponent', () => {
  let component: PanelOpcionesComponent;
  let fixture: ComponentFixture<PanelOpcionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelOpcionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelOpcionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
