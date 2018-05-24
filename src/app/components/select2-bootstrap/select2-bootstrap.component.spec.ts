import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Select2BootstrapComponent } from './select2-bootstrap.component';

describe('Select2BootstrapComponent', () => {
  let component: Select2BootstrapComponent;
  let fixture: ComponentFixture<Select2BootstrapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Select2BootstrapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Select2BootstrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
