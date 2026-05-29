import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VoaIngesterService } from './voa.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { IngestionStatus, JobStatus } from '@prisma/client';

// ── Mock RssParser ─────────────────────────────────────────────────────────

const mockFeed = {
  items: [
    {
      title: 'VOA Article 1',
      link: 'https://learningenglish.voanews.com/article/1',
      guid: 'guid-1',
      pubDate: '2026-01-01',
      categories: ['News'],
      contentSnippet:
        'The quick brown fox jumps over the lazy dog. '.repeat(15), // ~135 words > 100 min
      content: 'The quick brown fox jumps over the lazy dog. '.repeat(15),
      enclosure: { url: 'https://example.com/audio1.mp3' },
    },
    {
      title: 'VOA Article 2',
      link: 'https://learningenglish.voanews.com/article/2',
      guid: 'guid-2',
      pubDate: '2026-01-02',
      categories: [],
      contentSnippet: 'Too short.', // < 100 words → REJECTED
      content: 'Too short.',
    },
  ],
};

jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL: jest.fn().mockResolvedValue(mockFeed),
  }));
});

// Mock fetch for audio download
global.fetch = jest.fn().mockResolvedValue({
  ok: false,
  status: 404,
}) as jest.Mock;

// ── Mock PrismaService ────────────────────────────────────────────────────

const mockCreate = jest.fn().mockResolvedValue({ id: 'job-1' });
const mockUpdate = jest.fn().mockResolvedValue({});
const mockFindUnique = jest.fn();

const mockPrisma = {
  ingestionJob: { create: mockCreate, update: mockUpdate },
  rawContent: {
    findUnique: mockFindUnique,
    create: jest.fn().mockResolvedValue({}),
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────

describe('VoaIngesterService', () => {
  let service: VoaIngesterService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoaIngesterService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, def = '') => {
              const map: Record<string, string> = {
                'aws.region': 'eu-west-3',
                'aws.accessKeyId': '',
                'aws.secretAccessKey': '',
                'polly.s3Bucket': '',
                's3.publicUrl': '',
              };
              return map[key] ?? def;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<VoaIngesterService>(VoaIngesterService);
  });

  it('should create an IngestionJob and complete it', async () => {
    mockFindUnique.mockResolvedValue(null); // No existing items

    await service.ingestFeed('VOA_BEGINNING');

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: JobStatus.RUNNING }),
      }),
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: JobStatus.COMPLETED }),
      }),
    );
  });

  it('should import article with enough words', async () => {
    mockFindUnique.mockResolvedValue(null);

    const metrics = await service.ingestFeed('VOA_BEGINNING');

    // Article 2 is rejected (too short), Article 1 is imported
    expect(metrics.imported).toBe(1);
    expect(metrics.skipped).toBe(1);
  });

  it('should reject articles with too few words', async () => {
    mockFindUnique.mockResolvedValue(null);

    await service.ingestFeed('VOA_BEGINNING');

    const createCalls = (mockPrisma.rawContent.create as jest.Mock).mock.calls;
    const rejectedCall = createCalls.find(
      (c) => c[0].data.status === IngestionStatus.REJECTED,
    );
    expect(rejectedCall).toBeDefined();
  });

  it('should skip already-ingested articles (idempotence)', async () => {
    // Both articles already exist in DB
    mockFindUnique.mockResolvedValue({ id: 'existing' });

    const metrics = await service.ingestFeed('VOA_BEGINNING');

    expect(metrics.imported).toBe(0);
    expect(metrics.skipped).toBe(2);
    expect(mockPrisma.rawContent.create).not.toHaveBeenCalled();
  });

  it('should set audio_url to null when S3 is not configured', async () => {
    mockFindUnique.mockResolvedValue(null);

    await service.ingestFeed('VOA_BEGINNING');

    const importedCall = (mockPrisma.rawContent.create as jest.Mock).mock.calls.find(
      (c) => c[0].data.status === IngestionStatus.PENDING,
    );
    expect(importedCall?.[0].data.audio_url).toBeNull();
  });

  it('should handle RSS fetch failure gracefully', async () => {
    const RssParserMock = (await import('rss-parser')) as any;
    RssParserMock.mockImplementationOnce(() => ({
      parseURL: jest.fn().mockRejectedValue(new Error('Network error')),
    }));

    // Re-create service with failing parser
    const module = await Test.createTestingModule({
      providers: [
        VoaIngesterService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => '') },
        },
      ],
    }).compile();

    const failingService = module.get<VoaIngesterService>(VoaIngesterService);
    // Should not throw
    await expect(failingService.ingestFeed('VOA_BEGINNING')).resolves.not.toThrow();

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: JobStatus.FAILED }),
      }),
    );
  });
});
