import { expect, test } from 'vitest';
import { integrationTestCases, getTestsSubset } from '@integrationTests';

test('get test(s) without LLM only', () => {
  const subset = getTestsSubset(integrationTestCases, { withLabeling: false, environment: 'development' });
  expect(subset.length).toBe(15);
});

test('get test(s) without LLM and mail only action', () => {
  const subset = getTestsSubset(integrationTestCases, {
    withLabeling: false,
    actions: 'mail',
    environment: 'development',
  });
  expect(subset.length).toBe(4);
});

test('get test(s) without LLM and fio only action', () => {
  const subset = getTestsSubset(integrationTestCases, {
    withLabeling: false,
    actions: 'fio',
    environment: 'development',
  });
  expect(subset.length).toBe(4);
});

test('get test(s) without LLM and all actions', () => {
  const subset = getTestsSubset(integrationTestCases, {
    withLabeling: false,
    actions: 'all',
    environment: 'development',
  });
  expect(subset.length).toBe(4);
});

test('get test(s) without LLM, all actions and full cleanup', () => {
  const subset = getTestsSubset(integrationTestCases, {
    withLabeling: false,
    actions: 'all',
    cleanup: 'all',
    environment: 'development',
  });
  expect(subset.length).toBe(1);
});

test('get test(s) without LLM, all actions and mail cleanup', () => {
  const subset = getTestsSubset(integrationTestCases, {
    withLabeling: false,
    actions: 'all',
    cleanup: 'mail',
    environment: 'development',
  });
  expect(subset.length).toBe(1);
});

test('get test(s) without LLM, all actions and sheets cleanup', () => {
  const subset = getTestsSubset(integrationTestCases, {
    withLabeling: false,
    actions: 'all',
    cleanup: 'sheets',
    environment: 'development',
  });
  expect(subset.length).toBe(1);
});

test('get all tests when no condition provided', () => {
  const subset = getTestsSubset(integrationTestCases, { environment: 'development' });
  console.log('subset', subset);
  expect(subset.length).toBe(27);
});
