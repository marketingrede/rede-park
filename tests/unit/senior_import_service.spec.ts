import { test } from '@japa/runner'
import {
  normalizeSearchText,
  normalizePhone,
  normalizePlate,
  normalizeDigits,
  makeSeniorSourceKey,
} from '#services/normalization_service'

test.group('SeniorImportService - normalization helpers', () => {
  test('normalizeSearchText remove acentos e normaliza para maiusculo', ({ assert }) => {
    assert.equal(normalizeSearchText('João da Silva'), 'JOAO DA SILVA')
    assert.equal(normalizeSearchText('  Maria  Souza  '), 'MARIA SOUZA')
    assert.equal(normalizeSearchText('São Paulo'), 'SAO PAULO')
  })

  test('normalizePlate remove caracteres nao alfanumericos', ({ assert }) => {
    assert.equal(normalizePlate('ABC-1D23'), 'ABC1D23')
    assert.equal(normalizePlate('abc 1d23'), 'ABC1D23')
    assert.equal(normalizePlate('XYZ9A87'), 'XYZ9A87')
  })

  test('normalizeDigits mantem apenas numeros', ({ assert }) => {
    assert.equal(normalizeDigits('123.456.789-00'), '12345678900')
    assert.equal(normalizeDigits('(27) 99999-1111'), '27999991111')
    assert.equal(normalizeDigits(''), '')
  })

  test('normalizePhone adiciona prefixo 55 quando ausente', ({ assert }) => {
    assert.equal(normalizePhone('(27) 99999-1111'), '5527999991111')
    assert.equal(normalizePhone('5527999991111'), '5527999991111')
    assert.equal(normalizePhone(''), '')
  })

  test('makeSeniorSourceKey gera chave estavel', ({ assert }) => {
    const key = makeSeniorSourceKey({
      fullName: 'João da Silva',
      birthDate: '1990-01-20',
      costCenterCode: '30082',
    })
    assert.equal(key, 'JOAO DA SILVA|1990-01-20|30082')
  })

  test('makeSeniorSourceKey trata campos nulos', ({ assert }) => {
    const key = makeSeniorSourceKey({
      fullName: 'Maria Souza',
      birthDate: null,
      costCenterCode: null,
    })
    assert.equal(key, 'MARIA SOUZA|SEM-DATA|SEM-CC')
  })
})
