<?php

namespace Tests\Feature;

use Tests\TestCase;

class LoginTest extends TestCase
{
    public function test_login_page_renders_successfully(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertSee('Sanjeewa Advertising', false);
        $response->assertSee('id="email"', false);
        $response->assertSee('id="pw"', false);
        $response->assertSee('id="form"', false);
    }

    public function test_admin_login_page_renders_successfully(): void
    {
        $response = $this->get('/admin/login');

        $response->assertStatus(200);
        $response->assertSee('Admin', false);
    }

    public function test_root_url_redirects_to_login(): void
    {
        $response = $this->get('/');

        $response->assertRedirect('/login');
    }

    public function test_admin_url_redirects_to_admin_login(): void
    {
        $response = $this->get('/admin');

        $response->assertRedirect('/admin/login');
    }
}
