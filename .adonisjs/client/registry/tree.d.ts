/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  public: {
    collaboratorRegister: typeof routes['public.collaborator_register']
  }
  publicCollaborators: {
    lookup: typeof routes['public_collaborators.lookup']
    submit: typeof routes['public_collaborators.submit']
  }
  home: typeof routes['home']
  operations: {
    index: typeof routes['operations.index']
  }
  visitors: {
    index: typeof routes['visitors.index']
    store: typeof routes['visitors.store']
    exit: typeof routes['visitors.exit']
  }
  contactAttempts: {
    store: typeof routes['contact_attempts.store']
  }
  media: {
    show: typeof routes['media.show']
  }
  dashboard: {
    index: typeof routes['dashboard.index']
  }
  employees: {
    index: typeof routes['employees.index']
    store: typeof routes['employees.store']
    bulkDestroy: typeof routes['employees.bulk_destroy']
    update: typeof routes['employees.update']
  }
  vehicles: {
    index: typeof routes['vehicles.index']
    store: typeof routes['vehicles.store']
    update: typeof routes['vehicles.update']
  }
  imports: {
    index: typeof routes['imports.index']
    store: typeof routes['imports.store']
    downloadTemplate: typeof routes['imports.download_template']
    storeAuxiliary: typeof routes['imports.store_auxiliary']
    bulkDestroy: typeof routes['imports.bulk_destroy']
  }
  users: {
    index: typeof routes['users.index']
    store: typeof routes['users.store']
    update: typeof routes['users.update']
  }
  admin: {
    approvals: {
      index: typeof routes['admin.approvals.index']
      approve: typeof routes['admin.approvals.approve']
      reject: typeof routes['admin.approvals.reject']
    }
  }
}
