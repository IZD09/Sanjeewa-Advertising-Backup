<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Prevent Laravel Vite from emitting <link rel="preload" as="style"> for CSS/SCSS files,
        // which triggers Chrome "preloaded but not used" warnings during Turbo SPA navigation.
        Vite::usePreloadTagAttributes(function (string $src, string $url): array|false {
            $lowerUrl = strtolower($url);
            $lowerSrc = strtolower($src);

            if (str_ends_with($lowerUrl, '.css') || str_ends_with($lowerSrc, '.css') || str_ends_with($lowerSrc, '.scss')) {
                return false;
            }

            return [];
        });
    }
}
