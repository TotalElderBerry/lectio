import { describe, expect, it } from 'vitest'
import {
  isPlausibleReference,
  isTranslationId,
  normalizeReference,
  translationName,
} from '../shared/utils/scripture'

describe('normalizeReference', () => {
  it('collapses the many ways one passage gets typed onto a single key', () => {
    const forms = [
      'John 3:16-17',
      'john 3:16-17',
      '  John  3 : 16 - 17  ',
      'John 3:16–17', // en dash
      'John 3:16-17.',
      'John 3:16-17 .', // trailing punctuation with a space before it
      'John 3:16-17...',
    ]
    const keys = new Set(forms.map(normalizeReference))
    expect(keys.size).toBe(1)
    expect([...keys][0]).toBe('john 3:16-17')
  })

  it('keeps a leading book number distinct', () => {
    expect(normalizeReference('1 Corinthians 13')).toBe('1 corinthians 13')
    expect(normalizeReference('2 Corinthians 13')).toBe('2 corinthians 13')
  })

  it('normalises comma-separated verse lists', () => {
    expect(normalizeReference('Psalm 23:1, 4 , 6')).toBe('psalm 23:1,4,6')
  })

  it('leaves no trailing whitespace behind after stripping punctuation', () => {
    expect(normalizeReference('  Psalm  23 .')).toBe('psalm 23')
    expect(normalizeReference('Psalm 23   ')).toBe('psalm 23')
  })
})

describe('isPlausibleReference', () => {
  it('accepts an ordinary reference', () => {
    expect(isPlausibleReference(normalizeReference('Psalm 23'))).toBe(true)
  })

  it('rejects empty, numeric-only and overlong input', () => {
    expect(isPlausibleReference('')).toBe(false)
    expect(isPlausibleReference('3:16')).toBe(false)
    expect(isPlausibleReference('a'.repeat(101))).toBe(false)
  })
})

describe('translations', () => {
  it('recognises the ids we serve and rejects others', () => {
    expect(isTranslationId('web')).toBe(true)
    expect(isTranslationId('dra')).toBe(true)
    expect(isTranslationId('nabre')).toBe(false)
    expect(isTranslationId(undefined)).toBe(false)
  })

  it('labels pasted text rather than showing a raw id', () => {
    expect(translationName('custom')).toBe('Your own text')
    expect(translationName('dra')).toBe('Douay-Rheims')
  })
})
