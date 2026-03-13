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
        // Prefer fetching the sample from backend (/sample) to avoid dev-server or IDM interception of static assets.
        // Derive backend base from configured api url or default to localhost:3000
        const configured = (window as any)['__env_api_url'] || '';
        const apiBase = configured && configured.includes('/api/') ? configured.replace(/\/api\/.*$/,'') : (configured || 'http://localhost:3000');
        let blob: Blob | null = null;

        // 1) try backend endpoint
        try {
          const resp = await fetch(`${apiBase}/sample`);
          if (resp.ok) {
            const b = await resp.blob();
            if (b && b.size > 0) blob = b;
          }
        } catch (e) {
          // ignore and fallback
        }

        // 2) fallback to served assets
        if (!blob) {
          try {
            const url = `/assets/sample-insurance.pdf?ts=${Date.now()}`;
            const resp = await fetch(url);
            if (resp.ok) {
              const b = await resp.blob();
              if (b && b.size > 0) blob = b;
            }
          } catch (e) {
            // ignore
          }
        }

        // 3) final fallback: use embedded sample content (ensures feature works even if IDM blocks requests)
        if (!blob) {
          const embedded = EMBEDDED_SAMPLE_PDF;
          const b = new Blob([embedded], { type: 'application/pdf' });
          if (b && b.size > 0) blob = b;
        }

        if (!blob) throw new Error('Sample document is empty or unavailable after all fallbacks');
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

// Embedded minimal PDF content (ASCII PDF). Used as a last-resort fallback when asset/backend fetches are blocked.
const EMBEDDED_SAMPLE_PDF = `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 500 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 94 >>
stream
BT /F1 12 Tf 20 160 Td (Sample Insurance Policy) Tj 0 -16 Td (Policy No: P-12345) Tj 0 -16 Td (Insurer: Acme Insurance Co.) Tj 0 -16 Td (Policyholder: John Doe) Tj 0 -16 Td (Effective: 2025-01-01) Tj 0 -16 Td (Expiry: 2026-01-01) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000110 00000 n 
0000000210 00000 n 
0000000290 00000 n 
trailer
<< /Root 1 0 R /Size 6 >>
startxref
360
%%EOF
`;
