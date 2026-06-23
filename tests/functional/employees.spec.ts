import { test } from '@japa/runner'
import User from '#models/user'
import Employee from '#models/employee'

test.group('Employees', (group) => {
  group.each.setup(async () => {
    await Employee.query().delete()
    await User.query().delete()
    await User.create({
      fullName: 'Admin',
      email: 'admin@test.com',
      password: 'Senha123',
      role: 'admin',
      status: 'active',
    })
  })

  test('admin pode listar colaboradores', async ({ http }) => {
    await http.post('/login').form({
      email: 'admin@test.com',
      password: 'Senha123',
    })

    const response = await http.get('/colaboradores')
    response.assertStatus(200)
  })

  test('admin pode criar colaborador', async ({ http, assert }) => {
    await http.post('/login').form({
      email: 'admin@test.com',
      password: 'Senha123',
    })

    const response = await http.post('/colaboradores').form({
      fullName: 'Joao Silva',
      phone: '11999998888',
    })
    response.assertStatus(302)

    const employee = await Employee.findBy('normalized_name', 'JOAO SILVA')
    assert.isNotNull(employee)
    assert.equal(employee!.phone, '5511999998888')
  })

  test('operador nao pode acessar area admin', async ({ http, assert }) => {
    await User.create({
      fullName: 'Operador',
      email: 'operador@test.com',
      password: 'Senha123',
      role: 'operator',
      status: 'active',
    })

    await http.post('/login').form({
      email: 'operador@test.com',
      password: 'Senha123',
    })

    const response = await http.get('/colaboradores')
    response.assertStatus(302)
    assert.isTrue(response.header('location')?.includes('/operacao'))
  })

  test('operador pode acessar operacao', async ({ http }) => {
    await User.create({
      fullName: 'Operador',
      email: 'operador@test.com',
      password: 'Senha123',
      role: 'operator',
      status: 'active',
    })

    await http.post('/login').form({
      email: 'operador@test.com',
      password: 'Senha123',
    })

    const response = await http.get('/operacao')
    response.assertStatus(200)
  })
})
