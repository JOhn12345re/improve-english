import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { TtsService } from './tts.service';

// ── AWS SDK mocks ──────────────────────────────────────────────────────────

const mockPollyClient = { send: jest.fn() };
const mockS3Client = { send: jest.fn() };

jest.mock('@aws-sdk/client-polly', () => ({
  PollyClient: jest.fn().mockImplementation(() => mockPollyClient),
  SynthesizeSpeechCommand: jest.fn().mockImplementation((input) => ({ input })),
  Engine: { NEURAL: 'neural' },
  OutputFormat: { MP3: 'mp3' },
  TextType: { TEXT: 'text' },
  VoiceId: {},
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => mockS3Client),
  HeadObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  NotFound: class NotFound extends Error { constructor() { super('NotFound'); this.name = 'NotFound'; } },
}));

// ── Fixtures ───────────────────────────────────────────────────────────────

const AUDIO_BUFFER = Buffer.from('fake-mp3-data');

function makeAudioStream(): Readable {
  const stream = new Readable({ read() {} });
  stream.push(AUDIO_BUFFER);
  stream.push(null);
  return stream;
}

// ── Config mock ────────────────────────────────────────────────────────────

const configValues: Record<string, string> = {
  'polly.voiceId': 'Joanna',
  'polly.s3Bucket': 'test-bucket',
  's3.publicUrl': 'https://cdn.example.com',
  'aws.region': 'eu-west-3',
  'aws.accessKeyId': 'AKIATEST',
  'aws.secretAccessKey': 'secret',
};
const configMock = {
  get: jest.fn((key: string, def = '') => configValues[key] ?? def),
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('TtsService', () => {
  let service: TtsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TtsService,
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<TtsService>(TtsService);
    service.onModuleInit();
    jest.clearAllMocks();
  });

  // ── getOrGenerateAudio ─────────────────────────────────────────────────

  describe('getOrGenerateAudio()', () => {
    it('returns CDN URL from S3 cache when object already exists', async () => {
      // HeadObject succeeds → file exists
      mockS3Client.send.mockResolvedValueOnce({});

      const result = await service.getOrGenerateAudio('Hello world');

      expect(result.fromCache).toBe(true);
      expect(result.url).toMatch(/^https:\/\/cdn\.example\.com\/audio\/Joanna\//);
      expect(result.url).toMatch(/\.mp3$/);
      expect(mockPollyClient.send).not.toHaveBeenCalled();
    });

    it('calls Polly and uploads to S3 on cache miss', async () => {
      // HeadObject throws NotFound
      const { NotFound } = jest.requireMock('@aws-sdk/client-s3');
      mockS3Client.send
        .mockRejectedValueOnce(new NotFound())   // HeadObject
        .mockResolvedValueOnce({});               // PutObject

      mockPollyClient.send.mockResolvedValueOnce({
        AudioStream: makeAudioStream(),
      });

      const result = await service.getOrGenerateAudio('Hello world');

      expect(result.fromCache).toBe(false);
      expect(result.url).toMatch(/\.mp3$/);
      expect(mockPollyClient.send).toHaveBeenCalledTimes(1);
      expect(mockS3Client.send).toHaveBeenCalledTimes(2); // Head + Put
    });

    it('uses custom voiceId when provided', async () => {
      const { NotFound } = jest.requireMock('@aws-sdk/client-s3');
      mockS3Client.send
        .mockRejectedValueOnce(new NotFound())
        .mockResolvedValueOnce({});
      mockPollyClient.send.mockResolvedValueOnce({
        AudioStream: makeAudioStream(),
      });

      const result = await service.getOrGenerateAudio('Hello', { voiceId: 'Matthew' });

      expect(result.s3Key).toContain('audio/Matthew/');
    });

    it('generates consistent S3 key for identical text', async () => {
      mockS3Client.send.mockResolvedValue({});

      const r1 = await service.getOrGenerateAudio('same text');
      const r2 = await service.getOrGenerateAudio('same text');

      expect(r1.s3Key).toBe(r2.s3Key);
    });

    it('generates different S3 keys for different texts', async () => {
      mockS3Client.send.mockResolvedValue({});

      const r1 = await service.getOrGenerateAudio('hello');
      const r2 = await service.getOrGenerateAudio('goodbye');

      expect(r1.s3Key).not.toBe(r2.s3Key);
    });

    it('throws when Polly returns no AudioStream', async () => {
      const { NotFound } = jest.requireMock('@aws-sdk/client-s3');
      mockS3Client.send.mockRejectedValueOnce(new NotFound());
      mockPollyClient.send.mockResolvedValueOnce({ AudioStream: null });

      await expect(service.getOrGenerateAudio('hello')).rejects.toThrow(/AudioStream/);
    }, 15_000);

    it('still attempts synthesis when S3 HeadObject fails with unexpected error', async () => {
      mockS3Client.send
        .mockRejectedValueOnce(new Error('S3 auth error'))  // HeadObject fails
        .mockResolvedValueOnce({});                          // PutObject succeeds
      mockPollyClient.send.mockResolvedValueOnce({
        AudioStream: makeAudioStream(),
      });

      const result = await service.getOrGenerateAudio('hello');
      expect(result.fromCache).toBe(false);
    });
  });

  // ── ping ──────────────────────────────────────────────────────────────

  describe('ping()', () => {
    it('returns ok when Polly responds', async () => {
      mockPollyClient.send.mockResolvedValueOnce({ AudioStream: makeAudioStream() });

      const result = await service.ping();
      expect(result.status).toBe('ok');
    });

    it('returns skipped when AWS credentials are absent', async () => {
      const noCredConfig = {
        get: jest.fn((key: string, def = '') => {
          if (key === 'aws.accessKeyId') return '';
          return configValues[key] ?? def;
        }),
      };
      const module = await Test.createTestingModule({
        providers: [
          TtsService,
          { provide: ConfigService, useValue: noCredConfig },
        ],
      }).compile();
      const svc = module.get<TtsService>(TtsService);
      svc.onModuleInit();

      const result = await svc.ping();
      expect(result.status).toBe('skipped');
    });

    it('returns error when Polly throws', async () => {
      mockPollyClient.send.mockRejectedValue(new Error('Polly down'));

      const result = await service.ping();
      expect(result.status).toBe('error');
    }, 15_000);
  });
});
