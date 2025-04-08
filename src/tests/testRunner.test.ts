import { expect, test } from 'vitest'
import { integrationTestCases } from './integrationTestCases'
import { getTestsSubset } from './testRunner'

test('get test(s) without LLM only', () => {
  expect(getTestsSubset(integrationTestCases, ['--withLabeling=false']).length).toBe(15)
})

test('get test(s) without LLM and mail only action', () => {
  expect(getTestsSubset(integrationTestCases, ['--withLabeling=false', '--actions=mail']).length).toBe(4)
})

test('get test(s) without LLM and fio only action', () => {
  expect(getTestsSubset(integrationTestCases, ['--withLabeling=false', '--actions=fio']).length).toBe(4)
})

test('get test(s) without LLM and all actions', () => {
  expect(getTestsSubset(integrationTestCases, ['--withLabeling=false', '--actions=all']).length).toBe(4)
})

test('get test(s) without LLM, all actions and full cleanup', () => {
  expect(
    getTestsSubset(integrationTestCases, ['--withLabeling=false', '--actions=all', '--cleanup=all']).length,
  ).toBe(1)
})

test('get test(s) without LLM, all actions and mail cleanup', () => {
  expect(
    getTestsSubset(integrationTestCases, ['--withLabeling=false', '--actions=all', '--cleanup=mail']).length,
  ).toBe(1)
})

test('get test/s without LLM, all actions and sheets cleanup', () => {
  expect(
    getTestsSubset(integrationTestCases, ['--withLabeling=false', '--actions=all', '--cleanup=sheets'])
      .length,
  ).toBe(1)
})

test('get all tests when no condition provided', () => {
  expect(getTestsSubset(integrationTestCases, []).length).toBe(27)
})
