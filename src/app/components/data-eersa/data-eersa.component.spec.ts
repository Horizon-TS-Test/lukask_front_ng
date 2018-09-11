import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataEersaComponent } from './data-eersa.component';

describe('DataEersaComponent', () => {
  let component: DataEersaComponent;
  let fixture: ComponentFixture<DataEersaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataEersaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataEersaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
