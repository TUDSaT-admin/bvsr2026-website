import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SponsorFormDialogComponent } from './sponsor-form-dialog.component';
import { httpClientTestProviders } from '../../testing/http-test-providers';

describe('SponsorFormDialogComponent', () => {
  let component: SponsorFormDialogComponent;
  let fixture: ComponentFixture<SponsorFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsorFormDialogComponent, NoopAnimationsModule],
      providers: [
        ...httpClientTestProviders,
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } }
      ]
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
