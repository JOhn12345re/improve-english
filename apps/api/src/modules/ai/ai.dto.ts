import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class FeedbackDto {
  @IsEnum(['mcq', 'fill', 'translation'])
  exerciseType: 'mcq' | 'fill' | 'translation';

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @IsString()
  @IsNotEmpty()
  userAnswer: string;

  @IsString()
  level: string;
}

export class TranslationCheckDto {
  @IsString()
  @IsNotEmpty()
  sourceFr: string;

  @IsString()
  @IsNotEmpty()
  correctEn: string;

  @IsString()
  @IsNotEmpty()
  userAnswer: string;

  @IsString()
  level: string;
}
