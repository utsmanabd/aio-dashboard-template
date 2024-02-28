import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnfinishedActivityComponent } from './unfinished-activity.component';

describe('UnfinishedActivityComponent', () => {
  let component: UnfinishedActivityComponent;
  let fixture: ComponentFixture<UnfinishedActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnfinishedActivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnfinishedActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
