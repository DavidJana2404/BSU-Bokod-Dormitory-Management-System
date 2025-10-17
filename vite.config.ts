import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        // Optimize build settings for production deployment
        minify: 'esbuild',
        target: 'es2020',
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                // Consistent asset naming for better caching
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                // Automatic chunk optimization
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'vendor';
                        }
                        if (id.includes('@radix-ui')) {
                            return 'ui';
                        }
                        return 'vendor';
                    }
                }
            }
        }
    },
    server: {
        hmr: {
            overlay: false
        }
    }
});
