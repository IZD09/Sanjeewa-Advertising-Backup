import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
// Uncomment the import for your frontend framework:
// import vue from '@vitejs/plugin-vue';
// import react from '@vitejs/plugin-react';
// import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    build: {
        outDir: '../../public/build-ui',
        emptyOutDir: true,
        manifest: true,
    },
    plugins: [
        laravel({
            publicDirectory: '../../public',
            buildDirectory: 'build-ui',
            input: [
                __dirname + '/resources/assets/sass/app.scss',
                __dirname + '/resources/assets/js/app.js',
                __dirname + '/resources/assets/css/core.css',
                __dirname + '/resources/assets/css/dashboard.css',
                __dirname + '/resources/assets/css/modules.css',
                __dirname + '/resources/assets/css/place-order.css',
                __dirname + '/resources/assets/css/inventory.css',
                __dirname + '/resources/assets/css/grn.css',
                __dirname + '/resources/assets/css/payments.css',
                __dirname + '/resources/assets/css/components/sidebar.css',
                __dirname + '/resources/assets/js/core.js',
                __dirname + '/resources/assets/js/dashboard.js',
                __dirname + '/resources/assets/js/components/sidebar.js',
                __dirname + '/resources/assets/js/components/topbar.js',
                __dirname + '/resources/assets/js/place-order.js',
                __dirname + '/resources/assets/js/inventory.js',
                __dirname + '/resources/assets/js/grn.js',
                __dirname + '/resources/assets/js/payments.js'
            ],
            refresh: true,
        }),
        // Uncomment the plugin for your frontend framework:
        // vue({
        //     template: {
        //         transformAssetUrls: {
        //             base: null,
        //             includeAbsolute: false,
        //         },
        //     },
        // }),
        // react(),
        // svelte(),
    ],
    resolve: {
        alias: {
            '@': __dirname + '/resources/js',
        },
    },
});
