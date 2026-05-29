import { Test, TestingModule } from '@nestjs/testing';
import { CecrlClassifierService } from './cecrl-classifier.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/cache/redis.service';
import { CefrLevel } from '@englishflow/shared-types';

// Reference texts from CEFR corpus research
const REFERENCE_TEXTS: Record<string, string> = {
  A1: `
    Hello! My name is Tom. I am a boy. I have a cat. The cat is black.
    I like to play. I go to school. My school is big. I have a teacher.
    She is nice. I have friends. We play together. I am happy.
    My house is small. I have a bedroom. I sleep at night.
    My mother cooks food. It is good. I eat and drink.
  `.repeat(3),

  A2: `
    My name is Sophie and I live in Paris. I am fifteen years old and I go to
    school every day. In my free time I like listening to music and watching films.
    My favourite subject is English because I want to travel one day.
    I have a small dog called Max. He is very funny and loves to run in the park.
    On weekends my family goes to the market to buy fresh vegetables and fruit.
    I enjoy cooking simple meals with my mother. We often make pasta or soup.
  `.repeat(2),

  B1: `
    Every morning Tom takes the bus to work and reads the newspaper during the journey.
    He works in a small office where he deals with customer complaints and organises
    meetings for his manager. Although he finds the work quite repetitive sometimes,
    he appreciates having a stable job with regular hours. In the evenings he usually
    cooks dinner and watches the news before going to bed. He has been living in
    this city for three years and has gradually made some good friends there.
    The local community is quite diverse and he finds it interesting to meet people
    from different backgrounds and learn about their cultures.
  `.repeat(2),

  B2: `
    The development of renewable energy sources has become increasingly important
    in addressing climate change. Solar panels and wind turbines are now widely
    deployed across many countries, though significant challenges remain regarding
    energy storage and grid integration. Whereas fossil fuels once dominated global
    energy production, the economic viability of clean alternatives has improved
    substantially over the past decade. Consequently, many governments have
    introduced policies designed to accelerate the transition, including carbon
    taxes and renewable energy subsidies. Nevertheless, the pace of change varies
    considerably between developed and developing nations due to differences in
    infrastructure investment capacity and political priorities.
  `.repeat(2),

  C1: `
    The epistemological implications of quantum mechanics remain profoundly
    contentious among philosophers of science. Whereas classical physics presupposed
    an objective reality independent of observation, quantum theory fundamentally
    challenges this assumption through phenomena such as superposition and
    entanglement. The Copenhagen interpretation, championed by Bohr and Heisenberg,
    posits that physical systems do not possess definite properties prior to measurement,
    a position which Einstein famously rejected as incompatible with his conviction
    that God does not play dice with the universe. Contemporary interpretations,
    including many-worlds and pilot wave theories, attempt to circumvent this
    indeterminacy through various ontological commitments, none of which has achieved
    universal acceptance among practitioners of the discipline.
  `.repeat(2),

  C2: `
    The hermeneutical tradition inaugurated by Schleiermacher and subsequently
    elaborated by Dilthey, Gadamer, and Ricoeur constitutes an indispensable
    methodological framework for the human sciences, particularly insofar as it
    interrogates the conditions of possibility for cross-cultural understanding.
    Gadamer's notion of the fusion of horizons, whereby the interpreter's
    pre-understandings are transformed through genuine dialogue with the text,
    represents a sophisticated rejoinder to both Romantic subjectivism and
    positivist objectivism. This dialectical conception of interpretation, wherein
    the part is comprehensible only through the whole and vice versa, engenders
    what Gadamer designates the hermeneutical circle, a structure that is not
    vicious but rather constitutive of all meaningful understanding.
  `.repeat(2),
};

describe('CecrlClassifierService', () => {
  let service: CecrlClassifierService;

  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };

  // Mock Datamuse: simulate frequency by word length.
  // Curve calibrated so A1–C2 reference texts classify within ±1 level.
  // length ≤ 4  → f:80  (A1 core)
  // length ≤ 6  → f:30  (A1/A2)
  // length ≤ 9  → f:8   (B1)
  // length ≤ 12 → f:2   (C1)
  // length > 12 → f:0.4 (C2)
  global.fetch = jest.fn().mockImplementation((url: string) => {
    const match = url.match(/sp=([^&]+)/);
    const word = match ? decodeURIComponent(match[1]) : '';
    const len = word.length;
    const freq =
      len <= 4  ? 80  :
      len <= 6  ? 30  :
      len <= 9  ? 8   :
      len <= 12 ? 2   : 0.4;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ word, tags: [`f:${freq}`] }]),
    });
  }) as jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CecrlClassifierService,
        { provide: PrismaService, useValue: {} },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<CecrlClassifierService>(CecrlClassifierService);
  });

  const LEVEL_ORDER = [
    CefrLevel.A1, CefrLevel.A2, CefrLevel.B1,
    CefrLevel.B2, CefrLevel.C1, CefrLevel.C2,
  ];

  function levelIndex(level: CefrLevel): number {
    return LEVEL_ORDER.indexOf(level);
  }

  // Each reference text should classify within ±1 level of its target
  for (const [targetLevel, text] of Object.entries(REFERENCE_TEXTS)) {
    it(`classifies ${targetLevel} text within ±1 level`, async () => {
      const result = await service.classify(text);
      const targetIdx = levelIndex(targetLevel as CefrLevel);
      const resultIdx = levelIndex(result.level);

      expect(Math.abs(resultIdx - targetIdx)).toBeLessThanOrEqual(1);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.signals.avgWordFreq).toBeGreaterThan(0);
    }, 10_000);
  }

  it('returns B1 with 0 confidence for empty text', async () => {
    const result = await service.classify('');
    expect(result.level).toBe(CefrLevel.B1);
    expect(result.confidence).toBe(0);
  });

  it('uses redis cache for repeated words', async () => {
    mockRedis.get.mockResolvedValueOnce('25.0'); // cache hit
    const result = await service.classify('hello world test example phrase sentence');
    expect(result).toBeDefined();
    expect(mockRedis.set).not.toHaveBeenCalledWith(
      expect.stringContaining('hello'), expect.anything(), expect.anything(),
    );
  });
});
