import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-17',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', 'nuxt-auth-utils'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    // Overridable with NUXT_BIBLE_API_BASE if the upstream ever moves.
    bibleApiBase: 'https://bible-api.com',
    session: {
      name: 'lectio_session',
      // 30 days — this is a daily habit, signing in every week would be friction.
      maxAge: 60 * 60 * 24 * 30,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'A quiet place to pray Lectio Divina: read, reflect, respond, rest.' },
      ],
      script: [
        {
          // Applies the remembered theme before first paint, so a night prayer
          // never opens with a flash of white.
          innerHTML: `(function(){try{var t=localStorage.getItem('lectio-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`,
          tagPosition: 'head',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..600;1,400..500&family=Inter:wght@400..600&display=swap',
        },
      ],
    },
  },

  future: { compatibilityVersion: 4 },
})
