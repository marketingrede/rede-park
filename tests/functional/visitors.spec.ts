import { test } from '@japa/runner'
import User from '#models/user'
import Visitor from '#models/visitor'

test.group('Visitors', (group) => {
  let admin: User

  group.each.setup(async () => {
    await Visitor.query().delete()
    await User.query().delete()
    admin = await User.create({
      fullName: 'Admin',
      email: 'admin@test.com',
      password: 'Senha123',
      role: 'admin',
      status: 'active',
    })
  })

  test('visitante pode ser registrado', async ({ http, assert }) => {
    const response = await http.post('/visitantes').loginAs(admin).redirects(0).form({
      fullName: 'Visitante Teste',
      cpf: '12345678901',
      licensePlate: 'ABC1D23',
      visitReason: 'Reuniao',
    })
    response.assertStatus(302)

    const visitor = await Visitor.findBy('normalized_cpf', '12345678901')
    assert.isNotNull(visitor)
    assert.isNull(visitor!.exitedAt)
  })

  test('saida de visitante registra exited_at', async ({ http, assert }) => {
    await http.post('/visitantes').loginAs(admin).redirects(0).form({
      fullName: 'Visitante Saida',
      cpf: '98765432100',
      licensePlate: 'XYZ9A87',
    })

    const visitor = await Visitor.findBy('normalized_cpf', '98765432100')
    assert.isNotNull(visitor)

    const exitResponse = await http
      .post(`/visitantes/${visitor!.id}/saida`)
      .loginAs(admin)
      .redirects(0)
    exitResponse.assertStatus(302)

    await visitor!.refresh()
    assert.isNotNull(visitor!.exitedAt)
  })
})
