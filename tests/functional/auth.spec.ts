import { test } from '@japa/runner'
import User from '#models/user'

test.group('Auth', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('redireciona para login quando nao autenticado', async ({ http, assert }) => {
    const response = await http.get('/operacao')
    response.assertStatus(302)
    assert.isTrue(response.header('location')?.includes('/login'))
  })

  test('login com credenciais invalidas retorna erro', async ({ http }) => {
    const response = await http.post('/login').form({
      email: 'inexistente@test.com',
      password: 'senha123',
    })
    response.assertStatus(302)
  })

  test('signup cria o primeiro admin', async ({ http, assert }) => {
    const response = await http.post('/signup').form({
      fullName: 'Admin Teste',
      email: 'admin@test.com',
      password: 'Senha123',
      passwordConfirmation: 'Senha123',
    })
    response.assertStatus(302)

    const user = await User.findBy('email', 'admin@test.com')
    assert.isNotNull(user)
    assert.equal(user!.role, 'admin')
  })

  test('logout funciona', async ({ http, assert }) => {
    await http.post('/signup').form({
      fullName: 'Admin Teste',
      email: 'admin@test.com',
      password: 'Senha123',
      passwordConfirmation: 'Senha123',
    })

    const loginResponse = await http.post('/login').form({
      email: 'admin@test.com',
      password: 'Senha123',
    })
    loginResponse.assertStatus(302)

    const logoutResponse = await http.post('/logout')
    logoutResponse.assertStatus(302)
    assert.isTrue(logoutResponse.header('location')?.includes('/login'))
  })
})
