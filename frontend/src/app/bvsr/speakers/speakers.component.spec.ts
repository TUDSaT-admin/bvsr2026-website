import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { SpeakersComponent } from './speakers.component';
import { httpClientTestProviders } from '../../testing/http-test-providers';

describe('SpeakersComponent', () => {
  let component: SpeakersComponent;
  let fixture: ComponentFixture<SpeakersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeakersComponent, RouterTestingModule],
      providers: [...httpClientTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeakersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
