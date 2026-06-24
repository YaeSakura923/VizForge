import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'VizForge',
  description: 'VTK.js Visualization Pipeline Engine Documentation',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
    ],
    sidebar: {
      '/guide/': [
        { text: 'Getting Started', link: '/guide/' },
        { text: 'Architecture', link: '/guide/architecture' },
        { text: 'Pipeline Editor', link: '/guide/pipeline-editor' },
        { text: 'Shader Editor', link: '/guide/shader-editor' },
        { text: 'Animation Timeline', link: '/guide/animation-timeline' },
        { text: 'Deployment', link: '/guide/deployment' },
      ],
      '/api/': [
        { text: 'Core Package', link: '/api/core' },
        { text: 'Engine Package', link: '/api/engine' },
        { text: 'UI Package', link: '/api/ui' },
        { text: 'Bridge API', link: '/api/bridge' },
      ],
    },
  },
});
