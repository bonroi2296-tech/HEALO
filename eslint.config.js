import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    ignores: [
      '.next/**',
      '**/.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'out/**',
      'coverage/**',
      'src/legacy-pages/**',
      '**/legacy-pages/**',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        process: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      
      // 🚫 Legacy import 가드레일: src/legacy-pages 신규 import 금지
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['**/src/legacy-pages/**', '../**/legacy-pages/**', '../../**/legacy-pages/**', '../../../**/legacy-pages/**'],
              message: '🚫 Legacy import detected: src/legacy-pages는 신규 import가 금지됩니다. 기존 컴포넌트를 재사용하거나 새로운 구조로 작성하세요.',
            },
          ],
        },
      ],
    },
  },
  // ✅ Allowlist: 기존 legacy wrapper들은 예외 허용
  {
    files: [
      '**/src/AdminPage.jsx',
      '**/app/login/page.jsx',
      '**/app/signup/page.jsx',
      '**/app/success/page.jsx',
      '**/app/hospitals/*/HospitalDetailClient.jsx',
      '**/app/treatments/*/TreatmentDetailClient.jsx',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]
