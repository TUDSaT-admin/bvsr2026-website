import type { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

/** Use in TestBed when a component (or child like Navbar) injects I18nService / HttpClient. */
export const httpClientTestProviders: Array<Provider | EnvironmentProviders> = [
  provideHttpClient(),
  provideHttpClientTesting()
];
