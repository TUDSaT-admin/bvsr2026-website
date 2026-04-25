import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { SponsersComponent } from './sponsers.component';
import { httpClientTestProviders } from '../../testing/http-test-providers';

describe('SponsersComponent', () => {
  let component: SponsersComponent;
  let fixture: ComponentFixture<SponsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsersComponent, RouterTestingModule],
      providers: [...httpClientTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SponsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
