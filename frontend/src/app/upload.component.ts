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
  previewUrl: string | null = null;
  isDragOver = signal(false);

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.setFile(f);
  }

  setFile(f: File | null) {
    if (this.previewUrl) { URL.revokeObjectURL(this.previewUrl); this.previewUrl = null; }
    this.file = f;
    if (f && f.type?.startsWith('image/')) {
      this.previewUrl = URL.createObjectURL(f);
    } else {
      this.previewUrl = null;
    }
  }

  removeFile() {
    if (this.previewUrl) { URL.revokeObjectURL(this.previewUrl); this.previewUrl = null; }
    this.file = null;
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragOver.set(false);
    const f = e.dataTransfer?.files?.[0] ?? null;
    this.setFile(f);
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

  async copyResult() {
    try {
      const text = JSON.stringify(this.result ?? {}, null, 2);
      await navigator.clipboard.writeText(text);
    } catch (e) { /* no-op */ }
  }

  async copyRaw() {
    try {
      await navigator.clipboard.writeText(this.raw ?? '');
    } catch (e) { /* no-op */ }
  }
}
