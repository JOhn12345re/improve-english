import { Injectable, Logger } from '@nestjs/common';

const MIN_TEXT_CHARS = 50;

export interface ExtractResult {
  text: string;
  pageCount: number;
  metadata: Record<string, unknown>;
}

export interface TextChunk {
  title: string;
  content: string;
  position: number;
}

@Injectable()
export class PdfExtractorService {
  private readonly logger = new Logger(PdfExtractorService.name);

  async extractText(buffer: Buffer): Promise<ExtractResult> {
    try {
      // Dynamic import to avoid issues in environments without the native module
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);

      const text = data.text?.trim() ?? '';

      if (text.length < MIN_TEXT_CHARS) {
        throw new Error(`Extracted text too short (${text.length} chars) — possibly scanned PDF`);
      }

      return {
        text: normalizeText(text),
        pageCount: data.numpages ?? 0,
        metadata: data.info ?? {},
      };
    } catch (err) {
      this.logger.warn(`PDF extraction failed: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Splits extracted text into lesson-sized chunks.
   * Tries to split on chapter/section headings first, then by paragraph.
   */
  splitIntoLessons(
    text: string,
    options: { minWords: number; maxWords: number },
  ): TextChunk[] {
    const { minWords, maxWords } = options;

    // Try to detect chapter headings (all-caps lines, numbered sections, etc.)
    const chapterPattern = /\n((?:CHAPTER|SECTION|UNIT|LESSON|PART)\s+\w+[^\n]*)\n/gi;
    const splits = text.split(chapterPattern).filter(Boolean);

    const chunks: TextChunk[] = [];
    let position = 0;

    if (splits.length > 2) {
      // We found chapter-like headings
      for (let i = 0; i < splits.length; i += 2) {
        const title = splits[i]?.trim() ?? `Part ${position + 1}`;
        const content = splits[i + 1]?.trim() ?? '';
        const words = content.split(/\s+/).length;

        if (words >= minWords) {
          // If too long, sub-split by paragraph
          if (words > maxWords) {
            const subChunks = splitByParagraph(content, minWords, maxWords);
            for (const sub of subChunks) {
              chunks.push({ title: `${title} (${position + 1})`, content: sub, position });
              position++;
            }
          } else {
            chunks.push({ title, content, position });
            position++;
          }
        }
      }
    }

    if (chunks.length === 0) {
      // Fallback: split by paragraph
      const paraChunks = splitByParagraph(text, minWords, maxWords);
      for (const content of paraChunks) {
        chunks.push({ title: `Passage ${position + 1}`, content, position });
        position++;
      }
    }

    return chunks;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function splitByParagraph(
  text: string,
  minWords: number,
  maxWords: number,
): string[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  const chunks: string[] = [];
  let current = '';
  let currentWords = 0;

  for (const para of paragraphs) {
    const words = para.split(/\s+/).length;
    if (currentWords + words > maxWords && currentWords >= minWords) {
      chunks.push(current.trim());
      current = para;
      currentWords = words;
    } else {
      current += '\n\n' + para;
      currentWords += words;
    }
  }

  if (current.trim() && currentWords >= minWords) {
    chunks.push(current.trim());
  }

  return chunks;
}
