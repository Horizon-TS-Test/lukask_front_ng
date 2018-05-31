import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialBtnListComponent } from './material-btn-list.component';

describe('MaterialBtnListComponent', () => {
  let component: MaterialBtnListComponent;
  let fixture: ComponentFixture<MaterialBtnListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialBtnListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialBtnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
