import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TourRegistrationComponent } from './tour-registration.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

describe('TourRegistrationComponent', () => {
  let component: TourRegistrationComponent;
  let fixture: ComponentFixture<TourRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourRegistrationComponent, NoopAnimationsModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TourRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
