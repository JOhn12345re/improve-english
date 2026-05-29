import { Injectable, Logger } from '@nestjs/common';

const GUTENDEX_URL = 'https://gutendex.com/books';

export interface GutenbergBook {
  id: number;
  title: string;
  downloadUrl: string;
  format: 'txt' | 'pdf';
}

@Injectable()
export class GutenbergFetcherService {
  private readonly logger = new Logger(GutenbergFetcherService.name);

  async searchBySubject(subject: string, maxItems = 20): Promise<GutenbergBook[]> {
    try {
      const params = new URLSearchParams({
        topic: subject,
        languages: 'en',
      });
      const res = await fetch(`${GUTENDEX_URL}/?${params}`, {
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json() as {
        results: Array<{
          id: number;
          title: string;
          formats: Record<string, string>;
        }>;
      };

      const books: GutenbergBook[] = [];

      for (const book of data.results.slice(0, maxItems)) {
        const formats = book.formats ?? {};

        // Prefer plain text (reliable), fallback to PDF
        const txtUrl =
          formats['text/plain; charset=utf-8'] ??
          formats['text/plain; charset=us-ascii'] ??
          formats['text/plain'];

        const pdfUrl = formats['application/pdf'];

        if (txtUrl) {
          books.push({ id: book.id, title: book.title, downloadUrl: txtUrl, format: 'txt' });
        } else if (pdfUrl) {
          books.push({ id: book.id, title: book.title, downloadUrl: pdfUrl, format: 'pdf' });
        }
      }

      return books;
    } catch (err) {
      this.logger.warn(`Gutenberg search failed for "${subject}": ${(err as Error).message}`);
      return [];
    }
  }

  async downloadText(book: GutenbergBook): Promise<string> {
    const res = await fetch(book.downloadUrl, {
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    if (book.format === 'txt') {
      const text = await res.text();
      return stripGutenbergHeader(text);
    }

    // For PDF, return empty string — caller should handle via PdfExtractorService
    return '';
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripGutenbergHeader(text: string): string {
  // Gutenberg texts start with a header ending at "*** START OF" and end at "*** END OF"
  const startMatch = text.match(/\*{3}\s*START OF.*?\*{3}/i);
  const endMatch = text.match(/\*{3}\s*END OF.*?\*{3}/i);

  const start = startMatch ? text.indexOf(startMatch[0]) + startMatch[0].length : 0;
  const end = endMatch ? text.indexOf(endMatch[0]) : text.length;

  return text.slice(start, end).trim();
}
