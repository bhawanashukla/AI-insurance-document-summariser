import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'upload-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  file: File | null = null;
  loading = signal(false);
  result: any = null;
  raw = '';
  error: string | null = null;

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
  }

  async upload(useSample: boolean) {
    this.error = null;
    this.result = null;
    this.raw = '';
    this.loading.set(true);
    try {
      const form = new FormData();
      if (useSample) {
        const resp = await fetch('/sample-insurance.pdf');
        const blob = await resp.blob();
        form.append('file', blob, 'sample-insurance.pdf');
      } else {
        if (!this.file) { this.error = 'No file selected'; this.loading.set(false); return; }
        form.append('file', this.file, this.file.name);
      }

      const apiUrl = (window as any)['__env_api_url'] || 'http://localhost:3000/api/extract';
      const res = await fetch(apiUrl, { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) {
        this.error = json.error || 'Server error';
      } else {
        this.result = json.data ?? null;
        this.raw = json.raw ?? '';
      }
    } catch (err: any) {
      this.error = err?.message ?? String(err);
    } finally {
      this.loading.set(false);
    }
  }
}
