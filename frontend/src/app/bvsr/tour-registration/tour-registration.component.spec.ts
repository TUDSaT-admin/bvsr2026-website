import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TourRegistrationComponent } from './tour-registration.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { httpClientTestProviders } from '../../testing/http-test-providers';
import { RegistrationService } from '../../services/registration.service';

describe('TourRegistrationComponent', () => {
  let component: TourRegistrationComponent;
  let fixture: ComponentFixture<TourRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourRegistrationComponent, NoopAnimationsModule, RouterTestingModule],
      providers: [
        ...httpClientTestProviders,
        {
          provide: RegistrationService,
          useValue: {
            submitTourRegistration: () => Promise.resolve({ status: 'saved' as const })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TourRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
