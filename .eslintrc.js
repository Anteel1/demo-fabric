module.exports = {
    root: true,
    extends: [
        '@react-native-community',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'import', 'react-hooks'],
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                'no-shadow': 'off',
                '@typescraipt-eslint/no-shadow': 'off',
                'no-unused-vars': 'off',
                'import/no-named-as-default': 'off',
                'import/namespace': 'off',
                'import/no-unresolved': 'off',
                'import/order': [
                    'error',
                    {
                        groups: ['builtin', 'external', 'internal'],
                        pathGroups: [
                            {
                                pattern: 'react',
                                group: 'external',
                                position: 'before',
                            },
                        ],
                        pathGroupsExcludedImportTypes: ['react'],
                        'newlines-between': 'always',
                        alphabetize: {
                            order: 'asc',
                            caseInsensitive: true,
                        },
                    },
                ],
                'react-hooks/rules-of-hooks': 'error',
                'react-hooks/exhaustive-deps': 'warn',
            },
        },
    ],
}
