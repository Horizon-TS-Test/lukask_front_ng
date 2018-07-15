import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PubFormComponent } from './pub-form.component';

describe('PubFormComponent', () => {
  let component: PubFormComponent;
  let fixture: ComponentFixture<PubFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PubFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PubFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
