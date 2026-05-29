import { Injectable, Logger } from '@nestjs/common';
import { isLicenseAllowed } from './sources.config';

const SEARCH_URL = 'https://archive.org/advancedsearch.php';
const METADATA_URL = 'https://archive.org/metadata';
const DOWNLOAD_URL = 'https://archive.org/download';
const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export interface ArchiveItem {
  identifier: string;
  title: string;
  license: string | null;
  pdfUrl: string | null;
}

@Injectable()
export class ArchiveOrgFetcherService {
  private readonly logger = new Logger(ArchiveOrgFetcherService.name);

  async search(query: string, maxItems: number): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        output: 'json',
        rows: String(maxItems),
        fl: 'identifier',
        'sort[]': 'downloads desc',
      });

      const res = await fetch(`${SEARCH_URL}?${params}`, {
        headers: { 'User-Agent': process.env.ARCHIVE_ORG_USER_AGENT ?? 'EnglishFlow-Bot/1.0' },
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { response: { docs: Array<{ identifier: string }> } };
      return data.response.docs.map((d) => d.identifier);
    } catch (err) {
      this.logger.warn(`Archive.org search failed: ${(err as Error).message}`);
      return [];
    }
  }

  async getItemInfo(identifier: string): Promise<ArchiveItem> {
    const res = await fetch(`${METADATA_URL}/${identifier}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as {
      metadata?: { licenseurl?: string; rights?: string; title?: string };
      files?: Array<{ name: string; format?: string; size?: string }>;
    };

    const license =
      data.metadata?.licenseurl ??
      data.metadata?.rights ??
      null;

    if (!isLicenseAllowed(license)) {
      this.logger.debug(`Skipping ${identifier} — license not allowed: ${license}`);
      return { identifier, title: data.metadata?.title ?? identifier, license, pdfUrl: null };
    }

    // Find first PDF file
    const pdfFile = data.files?.find(
      (f) => f.name.toLowerCase().endsWith('.pdf') &&
             (!f.size || parseInt(f.size, 10) <= MAX_PDF_SIZE_BYTES),
    );

    const pdfUrl = pdfFile ? `${DOWNLOAD_URL}/${identifier}/${pdfFile.name}` : null;

    return {
      identifier,
      title: data.metadata?.title ?? identifier,
      license,
      pdfUrl,
    };
  }

  async downloadPdf(url: string): Promise<Buffer> {
    const res = await fetch(url, {
      headers: { 'User-Agent': process.env.ARCHIVE_ORG_USER_AGENT ?? 'EnglishFlow-Bot/1.0' },
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > MAX_PDF_SIZE_BYTES) {
      throw new Error(`PDF too large: ${buffer.length} bytes`);
    }
    return buffer;
  }
}
