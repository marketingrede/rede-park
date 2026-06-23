/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

const DashboardController = () => import('#controllers/dashboard_controller')
const OperationsController = () => import('#controllers/operations_controller')
const EmployeesController = () => import('#controllers/employees_controller')
const VehiclesController = () => import('#controllers/vehicles_controller')
const VisitorsController = () => import('#controllers/visitors_controller')
const ImportsController = () => import('#controllers/imports_controller')
const UsersController = () => import('#controllers/users_controller')
const ContactAttemptsController = () => import('#controllers/contact_attempts_controller')
const MediaController = () => import('#controllers/media_controller')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

const PublicCollaboratorsController = () => import('#controllers/public_collaborators_controller')
const ApprovalsController = () => import('#controllers/approvals_controller')

router.get('cadastro-colaborador', [PublicCollaboratorsController, 'showForm']).as('public.collaborator_register')
router.post('api/public/employees/lookup', [PublicCollaboratorsController, 'lookup'])
router.post('api/public/employees/submit', [PublicCollaboratorsController, 'submit'])

router
  .group(() => {
    router.get('/', ({ response }) => response.redirect().toPath('/operacao')).as('home')
    router.get('operacao', [OperationsController, 'index']).as('operations.index')
    router.get('visitantes', [VisitorsController, 'index']).as('visitors.index')
    router.post('visitantes', [VisitorsController, 'store']).as('visitors.store')
    router.post('visitantes/:id/saida', [VisitorsController, 'exit']).as('visitors.exit')
    router
      .post('contatos/whatsapp', [ContactAttemptsController, 'store'])
      .as('contact_attempts.store')
    router.get('media/:scope/:fileName', [MediaController, 'show']).as('media.show')

    router.post('logout', [controllers.Session, 'destroy'])

    router
      .group(() => {
        router.get('dashboard', [DashboardController, 'index']).as('dashboard.index')
        router.get('colaboradores', [EmployeesController, 'index']).as('employees.index')
        router.post('colaboradores', [EmployeesController, 'store']).as('employees.store')
        router.post('colaboradores/excluir-lote', [EmployeesController, 'bulkDestroy']).as('employees.bulk_destroy')
        router.post('colaboradores/:id', [EmployeesController, 'update']).as('employees.update')

        router.get('veiculos', [VehiclesController, 'index']).as('vehicles.index')
        router.post('veiculos', [VehiclesController, 'store']).as('vehicles.store')
        router.post('veiculos/:id', [VehiclesController, 'update']).as('vehicles.update')

        router.get('importacoes', [ImportsController, 'index']).as('imports.index')
        router.post('importacoes', [ImportsController, 'store']).as('imports.store')
        router.get('importacoes/modelos/:type', [ImportsController, 'downloadTemplate']).as('imports.download_template')
        router.post('importacoes/auxiliar', [ImportsController, 'storeAuxiliary']).as('imports.store_auxiliary')
        router.post('importacoes/excluir-lote', [ImportsController, 'bulkDestroy']).as('imports.bulk_destroy')

        router.get('usuarios', [UsersController, 'index']).as('users.index')
        router.post('usuarios', [UsersController, 'store']).as('users.store')
        router.post('usuarios/:id', [UsersController, 'update']).as('users.update')

        router.get('usuarios/aprovacoes', [ApprovalsController, 'index']).as('admin.approvals.index')
        router.post('usuarios/aprovacoes/:id/aprovar', [ApprovalsController, 'approve']).as('admin.approvals.approve')
        router.post('usuarios/aprovacoes/:id/rejeitar', [ApprovalsController, 'reject']).as('admin.approvals.reject')
      })
      .use(middleware.admin())
  })
  .use(middleware.auth())
