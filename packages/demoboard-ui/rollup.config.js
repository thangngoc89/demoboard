/**
 * Copyright (c) 2015-present Dan Abramov
 * This is based on the rollup config from Redux
 */

import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import createStyledComponentsTransformer from 'typescript-plugin-styled-components'

const CSSPattern = /\.css$/

function cssToString(opts = {}) {
  return {
    name: 'cssToString',
    transform(code, id) {
      if (CSSPattern.test(id)) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: '' },
        }
      }
    },
  }
}

const styledComponentsTransformer = createStyledComponentsTransformer({
  ssr: true,
})
const transformer = () => ({ before: [styledComponentsTransformer], after: [] })

const env = process.env.NODE_ENV
const config = {
  input: 'src/index.ts',

  output: [
    {
      dir: 'dist/es',
      format: 'esm',
      sourcemap: true,
    },
    {
      dir: 'dist/commonjs',
      format: 'cjs',
      sourcemap: true,
    },
  ],

  external(id) {
    if ((/^\w/.test(id) || id[0] === '@') && !CSSPattern.test(id)) {
      return true
    }
  },

  plugins: [
    nodeBuiltins(),
    nodeResolve({
      mainFields: ['module', 'main', 'jsnext:main'],
    }),
    cssToString(),
    typescript({
      abortOnError: false,
      module: 'ESNext',
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true,
    }),
    babel({
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react'],
      plugins: [
        '@babel/plugin-syntax-dynamic-import',
        'babel-plugin-styled-components',
      ],
    }),
    commonjs(),
    replace({
      // Don't set the env unless building for production, as it will cause
      // rollup to shake out the minified runtime.
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
  ],
}

if (env === 'production') {
  config.plugins.push(terser())
}

export default config
