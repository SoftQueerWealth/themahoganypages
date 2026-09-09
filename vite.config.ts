import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const GA_MEASUREMENT_ID = 'G-XWNSXDGLBC';
const GTM_CONTAINER_ID = 'GTM-5TZCSZFF';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const analyticsEnabled = env.VITE_ENABLE_ANALYTICS === 'true';

  return {
    plugins: [
      react(),
      {
        name: 'inject-google-analytics',
        transformIndexHtml(html) {
          if (!analyticsEnabled) return html;

          const gtmHead = `
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');</script>
    <!-- End Google Tag Manager -->
`;

          const gaSnippet = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
    </script>
`;

          const gtmNoscript = `
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
`;

          return html
            .replace('<head>', `<head>${gtmHead}${gaSnippet}`)
            .replace('<body>', `<body>${gtmNoscript}`);
        },
      },
    ],
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  };
});
