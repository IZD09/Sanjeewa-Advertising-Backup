<?php

namespace Tests\Feature;

use Tests\TestCase;

class CustomErrorPagesTest extends TestCase
{
    public function test_404_error_page_renders_with_custom_template(): void
    {
        $response = $this->get('/non-existent-route-for-testing-404');

        $response->assertStatus(404);
        $response->assertSee('404');
        $response->assertSee('Page Not Found');
        $response->assertSee('Reload Page');
        $response->assertSee('Home / Dashboard');
    }

    public function test_500_error_view_renders_cleanly(): void
    {
        $view = $this->view('errors.500', [
            'exception' => new \Exception('Database connection timeout simulated'),
        ]);

        $view->assertSee('500');
        $view->assertSee('Internal Server Error');
        $view->assertSee('Reload Page');
        $view->assertSee('Database connection timeout simulated');
    }

    public function test_403_error_view_renders_cleanly(): void
    {
        $view = $this->view('errors.403');

        $view->assertSee('403');
        $view->assertSee('Access Forbidden');
        $view->assertSee('Reload Page');
    }

    public function test_419_error_view_renders_cleanly(): void
    {
        $view = $this->view('errors.419');

        $view->assertSee('419');
        $view->assertSee('Page or Session Expired');
        $view->assertSee('Reload Page');
    }

    public function test_503_error_view_renders_cleanly(): void
    {
        $view = $this->view('errors.503');

        $view->assertSee('503');
        $view->assertSee('Service Unavailable');
        $view->assertSee('Reload Page');
    }

    public function test_429_error_view_renders_cleanly(): void
    {
        $view = $this->view('errors.429');

        $view->assertSee('429');
        $view->assertSee('Rate Limit Exceeded');
        $view->assertSee('Reload Page');
    }
}
