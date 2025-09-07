import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorFormDialogComponent } from './sponsor-form-dialog.component';

describe('SponsorFormDialogComponent', () => {
  let component: SponsorFormDialogComponent;
  let fixture: ComponentFixture<SponsorFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsorFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SponsorFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
