import { Injectable, Logger } from '@nestjs/common';
import { CefrLevel } from '@englishflow/shared-types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { TatoebaPair, TatoebaSentenceDto } from './tatoeba.types';

@Injectable()
export class TatoebaService {
  private readonly logger = new Logger(TatoebaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns random bilingual sentence pairs filtered by CEFR level.
   * @param level   - Target CEFR level for the source (EN) sentence.
   * @param sourceLang - ISO 639-3 source language (default: 'eng').
   * @param targetLang - ISO 639-3 target language (default: 'fra').
   * @param limit   - Maximum number of pairs to return (default 10).
   */
  async findRandom(
    level: CefrLevel,
    sourceLang = 'eng',
    targetLang = 'fra',
    limit = 10,
  ): Promise<TatoebaPair[]> {
    // Postgres TABLESAMPLE is ideal but Prisma doesn't support it directly;
    // using ORDER BY RANDOM() is acceptable for datasets < 500K rows.
    const links = await this.prisma.$queryRaw<
      Array<{
        source_id: number;
        target_id: number;
        source_text: string;
        target_text: string;
        cecrl_level: CefrLevel | null;
      }>
    >`
      SELECT
        l."sourceId"   AS source_id,
        l."targetId"   AS target_id,
        s.text         AS source_text,
        t.text         AS target_text,
        s."cecrlLevel" AS cecrl_level
      FROM "TatoebaLink" l
      JOIN "TatoebaSentence" s ON s.id = l."sourceId"
      JOIN "TatoebaSentence" t ON t.id = l."targetId"
      WHERE l."sourceLang" = ${sourceLang}
        AND l."targetLang" = ${targetLang}
        AND s."cecrlLevel" = ${level}::"CefrLevel"
      ORDER BY RANDOM()
      LIMIT ${limit}
    `;

    return links.map((row) => ({
      sourceId: row.source_id,
      targetId: row.target_id,
      sourceLang,
      targetLang,
      sourceText: row.source_text,
      targetText: row.target_text,
      cecrlLevel: row.cecrl_level,
    }));
  }

  /**
   * Full-text search over source sentences (case-insensitive ILIKE).
   */
  async search(
    query: string,
    sourceLang = 'eng',
    targetLang = 'fra',
    level?: CefrLevel,
    limit = 20,
  ): Promise<TatoebaPair[]> {
    const likePattern = `%${query}%`;

    // Two separate queries to avoid Prisma tagged-template limitations
    // with conditional fragments.
    const rows = level
      ? await this.prisma.$queryRaw<
          Array<{
            source_id: number;
            target_id: number;
            source_text: string;
            target_text: string;
            cecrl_level: CefrLevel | null;
          }>
        >`
          SELECT l."sourceId" AS source_id, l."targetId" AS target_id,
                 s.text AS source_text, t.text AS target_text,
                 s."cecrlLevel" AS cecrl_level
          FROM "TatoebaLink" l
          JOIN "TatoebaSentence" s ON s.id = l."sourceId"
          JOIN "TatoebaSentence" t ON t.id = l."targetId"
          WHERE l."sourceLang" = ${sourceLang}
            AND l."targetLang" = ${targetLang}
            AND s.text ILIKE ${likePattern}
            AND s."cecrlLevel" = ${level}::"CefrLevel"
          LIMIT ${limit}
        `
      : await this.prisma.$queryRaw<
          Array<{
            source_id: number;
            target_id: number;
            source_text: string;
            target_text: string;
            cecrl_level: CefrLevel | null;
          }>
        >`
          SELECT l."sourceId" AS source_id, l."targetId" AS target_id,
                 s.text AS source_text, t.text AS target_text,
                 s."cecrlLevel" AS cecrl_level
          FROM "TatoebaLink" l
          JOIN "TatoebaSentence" s ON s.id = l."sourceId"
          JOIN "TatoebaSentence" t ON t.id = l."targetId"
          WHERE l."sourceLang" = ${sourceLang}
            AND l."targetLang" = ${targetLang}
            AND s.text ILIKE ${likePattern}
          LIMIT ${limit}
        `;

    return rows.map((row) => ({
      sourceId: row.source_id,
      targetId: row.target_id,
      sourceLang,
      targetLang,
      sourceText: row.source_text,
      targetText: row.target_text,
      cecrlLevel: row.cecrl_level,
    }));
  }

  /**
   * Returns statistics about the imported dataset.
   */
  async stats(): Promise<
    Record<string, { total: number; byLevel: Partial<Record<CefrLevel, number>> }>
  > {
    const rows = await this.prisma.$queryRaw<
      Array<{ lang: string; cecrl_level: CefrLevel | null; count: bigint }>
    >`
      SELECT lang, "cecrlLevel" AS cecrl_level, COUNT(*) AS count
      FROM "TatoebaSentence"
      GROUP BY lang, "cecrlLevel"
      ORDER BY lang, "cecrlLevel"
    `;

    const result: Record<string, { total: number; byLevel: Partial<Record<CefrLevel, number>> }> =
      {};

    for (const row of rows) {
      if (!result[row.lang]) result[row.lang] = { total: 0, byLevel: {} };
      const count = Number(row.count);
      result[row.lang].total += count;
      if (row.cecrl_level) {
        result[row.lang].byLevel[row.cecrl_level] = count;
      }
    }

    return result;
  }

  /** Returns one sentence by ID (used by health check). */
  async findById(id: number): Promise<TatoebaSentenceDto | null> {
    const row = await this.prisma.tatoebaSentence.findUnique({ where: { id } });
    if (!row) return null;
    return {
      id: row.id,
      lang: row.lang,
      text: row.text,
      lengthChars: row.lengthChars,
      cecrlLevel: row.cecrlLevel as CefrLevel | null,
    };
  }
}
