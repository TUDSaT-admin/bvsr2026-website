import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, firstValueFrom } from 'rxjs';

export type AppLang = 'en' | 'de';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'bvsr-lang';

  readonly lang = signal<AppLang>('en');
  readonly loaded = signal(false);
  readonly languageChanged = new Subject<AppLang>();

  private readonly flat = signal<Record<string, string>>({});

  async initialize(): Promise<void> {
    const saved = localStorage.getItem(this.storageKey) as AppLang | null;
    const initial: AppLang = saved === 'de' ? 'de' : 'en';
    await this.loadAndSet(initial, false);
    this.loaded.set(true);
  }

  async setLang(lang: AppLang): Promise<void> {
    if (this.lang() === lang && Object.keys(this.flat()).length > 0) {
      return;
    }
    await this.loadAndSet(lang, true);
  }

  translate(key: string, params?: Record<string, string>): string {
    void this.lang();
    void this.flat();
    let text = this.flat()[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.split(`{{${k}}}`).join(v);
      }
    }
    return text;
  }

  private async loadAndSet(lang: AppLang, notify: boolean): Promise<void> {
    const data = await firstValueFrom(this.http.get<unknown>(`assets/i18n/${lang}.json`));
    const flattened = this.flatten(data);
    this.lang.set(lang);
    this.flat.set(flattened);
    localStorage.setItem(this.storageKey, lang);
    document.documentElement.lang = lang === 'de' ? 'de' : 'en';
    if (notify) {
      this.languageChanged.next(lang);
    }
  }

  private flatten(value: unknown, prefix = ''): Record<string, string> {
    const out: Record<string, string> = {};
    if (value === null || value === undefined) {
      return out;
    }
    if (typeof value === 'string') {
      if (prefix) {
        out[prefix] = value;
      }
      return out;
    }
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        const p = prefix ? `${prefix}.${i}` : String(i);
        Object.assign(out, this.flatten(item, p));
      });
      return out;
    }
    if (typeof value === 'object') {
      for (const k of Object.keys(value as Record<string, unknown>)) {
        const p = prefix ? `${prefix}.${k}` : k;
        Object.assign(out, this.flatten((value as Record<string, unknown>)[k], p));
      }
      return out;
    }
    return out;
  }
}
