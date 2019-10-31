/**
 * Copyright (c) 2015-present Dan Abramov
 * This is based on the rollup config from Redux
 */

import commonjs from 'rollup-plugin-commonjs'
import nodeBuiltins from 'rollup-plugin-node-builtins'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const env = process.env.NODE_ENV
const config = {
  input: {
    index: 'src/index.ts',
  },

  output: [
    {
      dir: 'dist/es',
      format: 'es',
      sourcemap: true,
    },
  ],

  external(id) {
    if (/^\w/.test(id) || id[0] === '@') {
      return true
    }
  },

  plugins: [
    nodeBuiltins(),
    nodeResolve({
      mainFields: ['module', 'main', 'jsnext:main'],
    }),
    commonjs(),
    typescript({
      abortOnError: false,
      module: 'ESNext',
      useTsconfigDeclarationDir: true,
    }),
  ],
}

if (env === 'production') {
  config.plugins.push(
    replace({
      // Don't set the env unless building for production, as it will cause
      // rollup to shake out the minified runtime.
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    terser(),
  )
}

export default config
