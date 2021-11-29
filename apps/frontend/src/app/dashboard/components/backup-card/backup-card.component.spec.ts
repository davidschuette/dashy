import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackupCardComponent } from './backup-card.component';

describe('BackupCardComponent', () => {
  let component: BackupCardComponent;
  let fixture: ComponentFixture<BackupCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackupCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BackupCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
