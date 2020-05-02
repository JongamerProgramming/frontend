import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlCenterChangelogPageComponent } from './control-center-changelog-page.component';

describe('ControlCenterChangelogPageComponent', () => {
  let component: ControlCenterChangelogPageComponent;
  let fixture: ComponentFixture<ControlCenterChangelogPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ControlCenterChangelogPageComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterChangelogPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
