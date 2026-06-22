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
    'dashboard': ExtractProps<(typeof import('../inertia/pages/dashboard.tsx'))['default']>
    'operations/index': ExtractProps<
      (typeof import('../inertia/pages/operations/index.tsx'))['default']
    >
    'employees/index': ExtractProps<
      (typeof import('../inertia/pages/employees/index.tsx'))['default']
    >
    'vehicles/index': ExtractProps<
      (typeof import('../inertia/pages/vehicles/index.tsx'))['default']
    >
    'visitors/index': ExtractProps<
      (typeof import('../inertia/pages/visitors/index.tsx'))['default']
    >
    'imports/index': ExtractProps<(typeof import('../inertia/pages/imports/index.tsx'))['default']>
    'users/index': ExtractProps<(typeof import('../inertia/pages/users/index.tsx'))['default']>
  }
}
