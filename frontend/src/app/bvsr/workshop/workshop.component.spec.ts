import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { WorkshopComponent } from './workshop.component';
import { httpClientTestProviders } from '../../testing/http-test-providers';

describe('WorkshopComponent', () => {
  let component: WorkshopComponent;
  let fixture: ComponentFixture<WorkshopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkshopComponent, RouterTestingModule],
      providers: [...httpClientTestProviders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkshopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
