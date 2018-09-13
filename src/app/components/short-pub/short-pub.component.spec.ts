import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortPubComponent } from './short-pub.component';

describe('ShortPubComponent', () => {
  let component: ShortPubComponent;
  let fixture: ComponentFixture<ShortPubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortPubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortPubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
