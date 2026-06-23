import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'admin/approvals/index': ExtractProps<(typeof import('../../inertia/pages/admin/approvals/index.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'dashboard': ExtractProps<(typeof import('../../inertia/pages/dashboard.tsx'))['default']>
    'employees/index': ExtractProps<(typeof import('../../inertia/pages/employees/index.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'imports/index': ExtractProps<(typeof import('../../inertia/pages/imports/index.tsx'))['default']>
    'operations/index': ExtractProps<(typeof import('../../inertia/pages/operations/index.tsx'))['default']>
    'public/collaborator_register': ExtractProps<(typeof import('../../inertia/pages/public/collaborator_register.tsx'))['default']>
    'public/privacy_policy': ExtractProps<(typeof import('../../inertia/pages/public/privacy_policy.tsx'))['default']>
    'users/index': ExtractProps<(typeof import('../../inertia/pages/users/index.tsx'))['default']>
    'vehicles/index': ExtractProps<(typeof import('../../inertia/pages/vehicles/index.tsx'))['default']>
    'visitors/index': ExtractProps<(typeof import('../../inertia/pages/visitors/index.tsx'))['default']>
  }
}
