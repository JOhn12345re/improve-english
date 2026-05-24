export interface TtsResult {
  /** Public CDN URL to the MP3 file */
  url: string;
  /** S3 object key (e.g. audio/Joanna/abc123.mp3) */
  s3Key: string;
  /** Whether the file already existed (cache hit) or was newly generated */
  fromCache: boolean;
}

export interface TtsOptions {
  /** Amazon Polly voice ID (default: value of POLLY_VOICE_ID env var) */
  voiceId?: string;
  /** Speech rate for SSML, e.g. "slow", "medium", "fast" (default: medium) */
  rate?: 'x-slow' | 'slow' | 'medium' | 'fast' | 'x-fast';
}
