# Responsive Design Checklist - Brila Mobile App

**Date**: 2026-06-06
**Method**: Code audit (no simulator available)

## Tab Screens

### Dashboard
- [x] SafeAreaView with top edge
- [ ] Bottom content padding sufficient (32px, needs 100px)
- [x] ScrollView for content
- [x] Flexible card layout
- [ ] Bottom nav overlap risk (last section)

### Lessons
- [x] SafeAreaView with top edge
- [ ] FlatList paddingBottom insufficient (32px, needs 100px)
- [x] FlatList scrollable
- [ ] Missing FlatList optimization flags
- [x] Card uses numberOfLines for text truncation

### Vocabulary
- [x] SafeAreaView with top edge
- [ ] Flashcard maxHeight hardcoded (320px)
- [x] Rating buttons use flex layout
- [x] Card container is flexible
- [ ] No explicit bottom padding

### Profile
- [x] SafeAreaView with top edge
- [x] Avatar fixed 80x80 (acceptable)
- [ ] Logout button marginTop:auto + marginBottom:16 (may overlap tab bar)
- [x] Stats row uses flex

## Onboarding Screens

### Welcome
- [x] Uses Screen component with full safe area
- [x] Flexible layout

### Name
- [x] KeyboardAvoidingView
- [x] Flexible input layout

### Native Language
- [x] FlatList for language options
- [x] Flexible card layout

### Level Assessment
- [ ] Level badge fontSize:40 may overflow small screens
- [x] Quiz options use flexible layout

### Goals
- [x] Goal cards use width:'47%' (responsive grid)
- [x] Minute cards use flex:1

## Lesson/Exercise Screen
- [x] SafeAreaView top + bottom edges
- [x] Progress bar responsive
- [x] MCQ options flexible
- [x] Fill blank input flexible
- [x] Sentence build uses flexWrap

## General
- [ ] No horizontal scroll prevention tested
- [x] Consistent 24px horizontal padding on most screens
- [x] Font sizes >= 12px (accessible)
- [ ] Touch targets not all >= 44x44pt (some rating buttons small)

## Summary
- **Portrait mode**: Generally good, main issue is bottom padding
- **Landscape mode**: Not tested (code audit only), flashcard maxHeight may cause issues
- **Large screens**: Flashcard maxHeight limits usable space
