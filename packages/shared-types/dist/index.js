"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseType = exports.SubscriptionStatus = exports.SubscriptionPlan = exports.DailyGoalMinutes = exports.LearningGoal = exports.NativeLanguage = exports.CefrLevel = void 0;
// Enums
var CefrLevel;
(function (CefrLevel) {
    CefrLevel["A1"] = "A1";
    CefrLevel["A2"] = "A2";
    CefrLevel["B1"] = "B1";
    CefrLevel["B2"] = "B2";
    CefrLevel["C1"] = "C1";
    CefrLevel["C2"] = "C2";
})(CefrLevel || (exports.CefrLevel = CefrLevel = {}));
var NativeLanguage;
(function (NativeLanguage) {
    NativeLanguage["FR"] = "fr";
    NativeLanguage["EN"] = "en";
    NativeLanguage["ES"] = "es";
    NativeLanguage["IT"] = "it";
    NativeLanguage["AR"] = "ar";
    NativeLanguage["PT"] = "pt";
    NativeLanguage["DE"] = "de";
})(NativeLanguage || (exports.NativeLanguage = NativeLanguage = {}));
var LearningGoal;
(function (LearningGoal) {
    LearningGoal["TRAVEL"] = "travel";
    LearningGoal["WORK"] = "work";
    LearningGoal["STUDIES"] = "studies";
    LearningGoal["LEISURE"] = "leisure";
    LearningGoal["OTHER"] = "other";
})(LearningGoal || (exports.LearningGoal = LearningGoal = {}));
var DailyGoalMinutes;
(function (DailyGoalMinutes) {
    DailyGoalMinutes[DailyGoalMinutes["FIVE"] = 5] = "FIVE";
    DailyGoalMinutes[DailyGoalMinutes["TEN"] = 10] = "TEN";
    DailyGoalMinutes[DailyGoalMinutes["FIFTEEN"] = 15] = "FIFTEEN";
    DailyGoalMinutes[DailyGoalMinutes["THIRTY"] = 30] = "THIRTY";
})(DailyGoalMinutes || (exports.DailyGoalMinutes = DailyGoalMinutes = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["FREE"] = "free";
    SubscriptionPlan["PREMIUM_MONTHLY"] = "premium_monthly";
    SubscriptionPlan["PREMIUM_YEARLY"] = "premium_yearly";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["TRIAL"] = "trial";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var ExerciseType;
(function (ExerciseType) {
    ExerciseType["MCQ"] = "mcq";
    ExerciseType["TRANSLATION"] = "translation";
    ExerciseType["LISTENING"] = "listening";
    ExerciseType["PRONUNCIATION"] = "pronunciation";
    ExerciseType["SENTENCE_BUILDER"] = "sentence_builder";
    ExerciseType["FREE_CONVERSATION"] = "free_conversation";
})(ExerciseType || (exports.ExerciseType = ExerciseType = {}));
