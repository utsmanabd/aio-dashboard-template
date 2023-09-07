import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineAreaComponent } from './machine-area.component';

describe('MachineAreaComponent', () => {
  let component: MachineAreaComponent;
  let fixture: ComponentFixture<MachineAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MachineAreaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachineAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
