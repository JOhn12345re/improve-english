export interface PdfSourceConfig {
  name: string;
  type: 'github_repo' | 'archive_org' | 'gutenberg' | 'manual';
  license: string;
}

export interface GithubRepoSource extends PdfSourceConfig {
  type: 'github_repo';
  repos: string[];
}

export interface ArchiveOrgSource extends PdfSourceConfig {
  type: 'archive_org';
  query: string;
  maxItems: number;
}

export interface GutenbergSource extends PdfSourceConfig {
  type: 'gutenberg';
  subjects: string[];
}

export type AnyPdfSource = GithubRepoSource | ArchiveOrgSource | GutenbergSource;

export const PDF_SOURCES: AnyPdfSource[] = [
  {
    name: 'Archive.org English Language Teaching',
    type: 'archive_org',
    query: 'collection:englishlanguageteaching AND mediatype:texts',
    maxItems: 100,
    license: 'public_domain',
  },
  {
    name: 'Gutenberg English Grammar Books',
    type: 'gutenberg',
    subjects: [
      'English language -- Grammar',
      'English language -- Composition and exercises',
    ],
    license: 'public_domain',
  },
];

/** Licenses considered safe to ingest. */
export const ALLOWED_LICENSES = new Set([
  'public_domain',
  'public domain',
  'cc-by',
  'cc-by-sa',
  'cc0',
  'https://creativecommons.org/licenses/by/',
  'https://creativecommons.org/licenses/by-sa/',
  'https://creativecommons.org/publicdomain/',
  'http://creativecommons.org/licenses/by/',
  'http://creativecommons.org/licenses/by-sa/',
  'http://creativecommons.org/publicdomain/',
]);

export function isLicenseAllowed(license: string | undefined | null): boolean {
  if (!license) return false;
  const normalized = license.toLowerCase().trim();
  for (const allowed of ALLOWED_LICENSES) {
    if (normalized.includes(allowed)) return true;
  }
  return false;
}
