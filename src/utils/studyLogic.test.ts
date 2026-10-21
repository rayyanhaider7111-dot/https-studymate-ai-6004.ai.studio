import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSyllabusProgress,
  calculateQuizScore,
  generateDailyTimetable,
  SUBJECT_METAS,
} from './studyLogic.ts';
import { StudyChapter, QuizQuestion } from '../types/index.ts';

test('calculateSyllabusProgress returns 0 for empty chapters', () => {
  assert.equal(calculateSyllabusProgress([]), 0);
});

test('calculateSyllabusProgress calculates correct weighted percentage', () => {
  const chapters: StudyChapter[] = [
    { id: '1', subject: 'physics', title: 'Ch 1', status: 'completed', estimatedHours: 2 }, // 0.85
    { id: '2', subject: 'physics', title: 'Ch 2', status: 'revised', estimatedHours: 2 },   // 1.00
    { id: '3', subject: 'maths', title: 'Ch 3', status: 'not_started', estimatedHours: 2 }, // 0.00
    { id: '4', subject: 'chemistry', title: 'Ch 4', status: 'in_progress', estimatedHours: 2 }, // 0.35
  ];
  // (0.85 + 1.0 + 0 + 0.35) / 4 = 2.2 / 4 = 0.55 = 55%
  assert.equal(calculateSyllabusProgress(chapters), 55);
});

test('calculateQuizScore evaluates correct responses and pass flag', () => {
  const mockQuestions: QuizQuestion[] = [
    { id: 1, question: 'Q1', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0, explanation: '', conceptTested: '' },
    { id: 2, question: 'Q2', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 2, explanation: '', conceptTested: '' },
    { id: 3, question: 'Q3', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 1, explanation: '', conceptTested: '' },
    { id: 4, question: 'Q4', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 3, explanation: '', conceptTested: '' },
    { id: 5, question: 'Q5', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0, explanation: '', conceptTested: '' },
  ];

  // 3 out of 5 correct = 60% (passed)
  const answersPass = { 1: 0, 2: 2, 3: 1, 4: 0, 5: 1 };
  const resPass = calculateQuizScore(mockQuestions, answersPass);
  assert.equal(resPass.score, 3);
  assert.equal(resPass.total, 5);
  assert.equal(resPass.percentage, 60);
  assert.equal(resPass.passed, true);

  // 1 out of 5 correct = 20% (failed)
  const answersFail = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 };
  const resFail = calculateQuizScore(mockQuestions, answersFail);
  assert.equal(resFail.score, 1);
  assert.equal(resFail.percentage, 20);
  assert.equal(resFail.passed, false);
});

test('generateDailyTimetable produces requested number of study sessions', () => {
  const slots = generateDailyTimetable(2, ['physics', 'chemistry']);
  // 2 hours = 120 minutes. Each session is 45 min + 15 min break = 60 min -> 2 slots
  assert.equal(slots.length, 2);
  assert.equal(slots[0].subject, 'physics');
  assert.equal(slots[1].subject, 'chemistry');
  assert.equal(slots[0].durationMinutes, 45);
});

test('SUBJECT_METAS includes all core Indian curriculum subjects', () => {
  assert.ok(SUBJECT_METAS.physics);
  assert.ok(SUBJECT_METAS.chemistry);
  assert.ok(SUBJECT_METAS.maths);
  assert.ok(SUBJECT_METAS.biology);
  assert.ok(SUBJECT_METAS.english);
  assert.equal(SUBJECT_METAS.physics.name, 'Physics');
});
