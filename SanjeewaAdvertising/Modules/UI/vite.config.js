import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import path from 'path';

export default defineConfig({
    root: import.meta.dirname,
    build: {
        outDir: path.resolve(import.meta.dirname, '../../public/build-ui'),
        emptyOutDir: true,
        manifest: 'manifest.json',
    },
    plugins: [
        laravel({
            publicDirectory: path.resolve(import.meta.dirname, '../../public'),
            buildDirectory: 'build-ui',
            input: [
                'resources/assets/sass/app.scss',
                'resources/assets/js/app.js',
                'resources/assets/css/core.css',
                'resources/assets/css/dashboard.css',
                'resources/assets/css/modules.css',
                'resources/assets/css/place-order.css',
                'resources/assets/css/inventory.css',
                'resources/assets/css/grn.css',
                'resources/assets/css/payments.css',
                'resources/assets/css/login.css',
                'resources/assets/css/admin-login.css',
                'resources/assets/css/admin-user-control.css',
                'resources/assets/css/admin-profile.css',
                'resources/assets/css/user-profile.css',
                'resources/assets/css/components/sidebar.css',
                'resources/assets/js/core.js',
                'resources/assets/js/dashboard.js',
                'resources/assets/js/components/sidebar.js',
                'resources/assets/js/components/topbar.js',
                'resources/assets/js/place-order.js',
                'resources/assets/js/customers.js',
                'resources/assets/js/inventory.js',
                'resources/assets/js/grn.js',
                'resources/assets/js/payments.js',
                'resources/assets/js/login.js',
                'resources/assets/js/admin/login.js',
                'resources/assets/js/admin/admin-login.js',
                'resources/assets/js/admin/dashboard.js',
                'resources/assets/js/admin/user-control/processes/UserControlManager.js',
                'resources/assets/js/admin/profile/AdminProfileManager.js',
                'resources/assets/js/profile.js',
                'resources/assets/js/profile/UserProfileManager.js'
            ],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, 'resources/js'),
        },
    },
});
