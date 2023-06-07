import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    './src/index',
    {
      builder: 'mkdist',
      input: './src/mailers/mailgun/',
      outDir: './dist/mailers/mailgun/',
    },
    {
      builder: 'mkdist',
      input: './src/mailers/ses/',
      outDir: './dist/mailers/ses/',
    },
  ],
  rollup: {
    esbuild: {
      target: 'es2022',
    },
  },
})
