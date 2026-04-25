import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { ImpressumComponent } from './impressum.component';
import { httpClientTestProviders } from '../../testing/http-test-providers';

describe('ImpressumComponent', () => {
  let component: ImpressumComponent;
  let fixture: ComponentFixture<ImpressumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpressumComponent, RouterTestingModule],
      providers: [...httpClientTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImpressumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
