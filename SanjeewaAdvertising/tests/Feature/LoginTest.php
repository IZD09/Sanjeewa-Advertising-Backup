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
}
