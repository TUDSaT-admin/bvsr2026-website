import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { MaterialModule } from '../../material/material.module';
import { SeoService } from '../../services/seo.service';
import { RegistrationService } from '../../services/registration.service';
import { TicketService } from '../../services/ticket.service';

interface FoundTicket {
  firstName: string;
  lastName: string;
  email: string;
  association: string;
  registrationId: string;
}

@Component({
  selector: 'app-get-ticket',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    MaterialModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './get-ticket.component.html',
  styleUrls: ['./get-ticket.component.css']
})
export class GetTicketComponent implements OnInit {
  emailForm: FormGroup;

  looking = false;
  errorMsg = '';
  notFound = false;
  downloading = false;
  downloadedFor: FoundTicket | null = null;

  constructor(
    private fb: FormBuilder,
    private seoService: SeoService,
    private registrationService: RegistrationService,
    private ticketService: TicketService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.seoService.updateSEO({
      title: 'Get my Ticket · BVSR Conference 2026'
    });
  }

  async onSubmit(): Promise<void> {
    this.errorMsg = '';
    this.notFound = false;
    this.downloadedFor = null;

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      this.errorMsg = 'Please enter a valid email address.';
      return;
    }

    const email = String(this.emailForm.value.email || '').trim();
    if (!email) {
      this.errorMsg = 'Please enter your email address.';
      return;
    }

    this.looking = true;
    try {
      const res = await this.registrationService.fetchRegisteredEvents({ email });

      if (!res.success) {
        this.errorMsg = res.message || 'Something went wrong while looking up your ticket. Please try again.';
        return;
      }
      if (!res.found || !res.registrationId) {
        this.notFound = true;
        return;
      }

      const ticket: FoundTicket = {
        firstName: res.firstName || '',
        lastName: res.lastName || '',
        email: res.email || email,
        association: res.association || '',
        registrationId: res.registrationId
      };

      this.downloading = true;
      try {
        await this.ticketService.generateAndDownloadTicket(ticket);
        this.downloadedFor = ticket;
      } catch (err: any) {
        console.error('[get-ticket] PDF generation failed', err);
        this.errorMsg = 'We found your registration but the ticket could not be generated. Please try again or contact the organisers.';
      } finally {
        this.downloading = false;
      }
    } catch (err: any) {
      console.error('[get-ticket] lookup failed', err);
      this.errorMsg = err?.message || 'Could not reach the server. Please check your connection and try again.';
    } finally {
      this.looking = false;
    }
  }

  async downloadAgain(): Promise<void> {
    if (!this.downloadedFor) return;
    this.downloading = true;
    try {
      await this.ticketService.generateAndDownloadTicket(this.downloadedFor);
    } catch (err) {
      console.error('[get-ticket] PDF re-download failed', err);
      this.errorMsg = 'Could not regenerate the ticket. Please try again.';
    } finally {
      this.downloading = false;
    }
  }

  reset(): void {
    this.errorMsg = '';
    this.notFound = false;
    this.downloadedFor = null;
    this.emailForm.reset();
  }
}
