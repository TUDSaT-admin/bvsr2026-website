import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly defaultImage = 'https://bvsr.tudsat.space/assets/images/pictogramColor.png';
  private readonly defaultSiteName = 'BVSR Conference 2026';
  private readonly baseUrl = 'https://bvsr.tudsat.space';

  constructor(
    private meta: Meta,
    private title: Title
  ) {}

  updateSEO(data: SEOData): void {
    const title = data.title || this.defaultSiteName;
    const description = data.description || 'Join the BVSR Conference 2026 in Darmstadt from May 14-17, 2026. Discover the future of space exploration with cutting-edge research, networking, and expert workshops.';
    const image = data.image || this.defaultImage;
    const url = data.url || this.baseUrl;
    const type = data.type || 'website';
    const siteName = data.siteName || this.defaultSiteName;

    // Update title
    this.title.setTitle(title);

    // Basic meta tags
    this.meta.updateTag({ name: 'description', content: description });
    if (data.keywords) {
      this.meta.updateTag({ name: 'keywords', content: data.keywords });
    }

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:site_name', content: siteName });

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    // Canonical URL
    this.updateCanonicalUrl(url);
  }

  private updateCanonicalUrl(url: string): void {
    // Remove existing canonical link if any
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Add new canonical link
    const link: HTMLLinkElement = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }
}
