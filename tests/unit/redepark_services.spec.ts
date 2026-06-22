import { test } from '@japa/runner'
import {
  formatPlate,
  makeSeniorSourceKey,
  normalizeDigits,
  normalizePhone,
  normalizePlate,
  normalizeSearchText,
} from '#services/normalization_service'
import { buildVehicleContactMessage, buildWhatsAppUrl } from '#services/whatsapp_link_service'

test.group('RedePark services', () => {
  test('normaliza busca sem acento e placa sem hifen', ({ assert }) => {
    assert.equal(normalizeSearchText('Vale Vitória'), 'VALE VITORIA')
    assert.equal(normalizePlate('abc-1d23'), 'ABC1D23')
    assert.equal(formatPlate('abc1d23'), 'ABC-1D23')
  })

  test('normaliza telefone e cpf como digitos', ({ assert }) => {
    assert.equal(normalizeDigits('123.456.789-00'), '12345678900')
    assert.equal(normalizePhone('(27) 99999-1111'), '5527999991111')
    assert.equal(normalizePhone('5527999991111'), '5527999991111')
  })

  test('gera chave Senior estavel para upsert', ({ assert }) => {
    assert.equal(
      makeSeniorSourceKey({
        fullName: 'Joao da Silva',
        birthDate: '1990-01-20',
        costCenterCode: '30082',
      }),
      'JOAO DA SILVA|1990-01-20|30082'
    )
  })

  test('gera link wa.me com mensagem codificada', ({ assert }) => {
    const message = buildVehicleContactMessage({
      employeeName: 'Joao',
      vehicleLabel: 'Toyota Corolla',
      licensePlate: 'ABC-1234',
    })
    const url = buildWhatsAppUrl('(27) 99999-1111', message)

    assert.include(url, 'https://wa.me/5527999991111?text=')
    assert.include(decodeURIComponent(url), 'Toyota Corolla')
    assert.include(decodeURIComponent(url), 'ABC-1234')
  })
})
