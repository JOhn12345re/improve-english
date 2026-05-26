export declare enum CefrLevel {
    A1 = "A1",
    A2 = "A2",
    B1 = "B1",
    B2 = "B2",
    C1 = "C1",
    C2 = "C2"
}
export declare enum NativeLanguage {
    FR = "fr",
    EN = "en",
    ES = "es",
    IT = "it",
    AR = "ar",
    PT = "pt",
    DE = "de"
}
export declare enum LearningGoal {
    TRAVEL = "travel",
    WORK = "work",
    STUDIES = "studies",
    LEISURE = "leisure",
    OTHER = "other"
}
export declare enum DailyGoalMinutes {
    FIVE = 5,
    TEN = 10,
    FIFTEEN = 15,
    THIRTY = 30
}
export declare enum SubscriptionPlan {
    FREE = "free",
    PREMIUM_MONTHLY = "premium_monthly",
    PREMIUM_YEARLY = "premium_yearly"
}
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    TRIAL = "trial"
}
export declare enum ExerciseType {
    MCQ = "mcq",
    TRANSLATION = "translation",
    LISTENING = "listening",
    PRONUNCIATION = "pronunciation",
    SENTENCE_BUILDER = "sentence_builder",
    FREE_CONVERSATION = "free_conversation"
}
export interface User {
    id: string;
    email: string;
    native_language: NativeLanguage;
    level: CefrLevel;
    daily_goal: DailyGoalMinutes;
    learning_goal: LearningGoal;
    streak: number;
    timezone: string;
    created_at: string;
    deleted_at: string | null;
}
export interface Lesson {
    id: string;
    level: CefrLevel;
    theme: string;
    order: number;
    content_json: LessonContent;
    created_at: string;
}
export interface LessonContent {
    title: Record<NativeLanguage, string>;
    description: Record<NativeLanguage, string>;
    exercises: Exercise[];
    estimated_minutes: number;
}
export interface Exercise {
    id: string;
    type: ExerciseType;
    instruction: Record<NativeLanguage, string>;
    data: MCQData | TranslationData | ListeningData | SentenceBuilderData;
    xp_reward: number;
}
export interface MCQData {
    question: string;
    options: string[];
    correct_index: number;
    explanation?: string;
}
export interface TranslationData {
    source_text: string;
    source_language: NativeLanguage;
    target_text: string;
    accepted_variants?: string[];
}
export interface ListeningData {
    audio_url: string;
    transcript: string;
    question: string;
    options: string[];
    correct_index: number;
}
export interface SentenceBuilderData {
    words: string[];
    correct_sentence: string;
    hint?: string;
}
export interface UserProgress {
    user_id: string;
    lesson_id: string;
    score: number;
    completed_at: string;
    attempts: number;
}
export interface VocabularyWord {
    id: string;
    word_en: string;
    translations_json: Record<NativeLanguage, string>;
    level: CefrLevel;
    audio_url: string | null;
}
export interface UserVocabulary {
    user_id: string;
    word_id: string;
    mastery_level: number;
    next_review_at: string;
}
export interface Subscription {
    user_id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    started_at: string;
    expires_at: string | null;
    revenuecat_id: string;
}
export interface ApiResponse<T> {
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}
export interface ApiError {
    statusCode: number;
    message: string;
    error: string;
}
export interface AssessmentQuestion {
    id: string;
    question: string;
    options: string[];
    correct_index: number;
    level_indicator: CefrLevel;
}
export interface AssessmentResult {
    level: CefrLevel;
    score: number;
    total: number;
}
export interface FreeTierLimits {
    daily_lessons: number;
    native_languages: number;
    ai_conversation: boolean;
    offline_mode: boolean;
    advanced_stats: boolean;
    certificate: boolean;
}
