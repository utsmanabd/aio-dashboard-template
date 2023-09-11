import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityTaskComponent } from './identity-task.component';

describe('IdentityTaskComponent', () => {
  let component: IdentityTaskComponent;
  let fixture: ComponentFixture<IdentityTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentityTaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentityTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
