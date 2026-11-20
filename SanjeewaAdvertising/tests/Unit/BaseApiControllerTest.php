<?php

namespace Tests\Unit;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Modules\Core\Http\Controllers\BaseApiController;
use Tests\TestCase;

class BaseApiControllerTest extends TestCase
{
    private TestApiController $controller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->controller = new TestApiController;
    }

    public function test_success_returns_expected_json_structure(): void
    {
        $response = $this->controller->callSuccess(['id' => 10, 'title' => 'Banner'], 'Fetched successfully.');

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());

        $data = $response->getData(true);
        $this->assertTrue($data['success']);
        $this->assertSame('Fetched successfully.', $data['message']);
        $this->assertSame(['id' => 10, 'title' => 'Banner'], $data['data']);
    }

    public function test_created_returns_201_status(): void
    {
        $response = $this->controller->callCreated(['id' => 1]);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(201, $response->getStatusCode());

        $data = $response->getData(true);
        $this->assertTrue($data['success']);
        $this->assertSame('Created successfully.', $data['message']);
        $this->assertSame(['id' => 1], $data['data']);
    }

    public function test_no_content_returns_204_status(): void
    {
        $response = $this->controller->callNoContent();

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(204, $response->getStatusCode());
        $this->assertEmpty($response->getData(true));
    }

    public function test_error_returns_status_and_errors(): void
    {
        $response = $this->controller->callError('Custom error message.', 500, ['code' => 'SYS_ERR']);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(500, $response->getStatusCode());

        $data = $response->getData(true);
        $this->assertFalse($data['success']);
        $this->assertSame('Custom error message.', $data['message']);
        $this->assertSame(['code' => 'SYS_ERR'], $data['errors']);
    }

    public function test_not_found_returns_404_status(): void
    {
        $response = $this->controller->callNotFound('Item was not found.');

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(404, $response->getStatusCode());

        $data = $response->getData(true);
        $this->assertFalse($data['success']);
        $this->assertSame('Item was not found.', $data['message']);
    }

    public function test_unauthorized_and_forbidden_responses(): void
    {
        $unauthResponse = $this->controller->callUnauthorized();
        $this->assertSame(401, $unauthResponse->getStatusCode());

        $forbiddenResponse = $this->controller->callForbidden();
        $this->assertSame(403, $forbiddenResponse->getStatusCode());
    }

    public function test_validation_error_formats_errors(): void
    {
        $validator = Validator::make(['email' => 'invalid-email'], [
            'email' => 'required|email',
        ]);

        $exception = new ValidationException($validator);
        $response = $this->controller->callValidationError($exception);

        $this->assertSame(422, $response->getStatusCode());
        $data = $response->getData(true);
        $this->assertFalse($data['success']);
        $this->assertSame('The given data was invalid.', $data['message']);
        $this->assertArrayHasKey('email', $data['errors']);
    }

    public function test_paginated_returns_pagination_metadata(): void
    {
        $items = collect([['id' => 1], ['id' => 2]]);
        $paginator = new LengthAwarePaginator($items, 20, 2, 1);

        $response = $this->controller->callPaginated($paginator);

        $this->assertSame(200, $response->getStatusCode());
        $data = $response->getData(true);
        $this->assertTrue($data['success']);
        $this->assertArrayHasKey('pagination', $data);
        $this->assertSame(20, $data['pagination']['total']);
        $this->assertSame(2, $data['pagination']['per_page']);
        $this->assertSame(1, $data['pagination']['current_page']);
    }

    public function test_redirect_returns_redirect_response(): void
    {
        $response = $this->controller->callRedirect('/dashboard');

        $this->assertInstanceOf(RedirectResponse::class, $response);
        $this->assertSame(302, $response->getStatusCode());
        $this->assertStringEndsWith('/dashboard', $response->getTargetUrl());
    }
}

class TestApiController extends BaseApiController
{
    public function callSuccess(mixed $data = null, string $message = 'Success.', int $status = 200): JsonResponse
    {
        return $this->success($data, $message, $status);
    }

    public function callCreated(mixed $data = null, string $message = 'Created successfully.'): JsonResponse
    {
        return $this->created($data, $message);
    }

    public function callNoContent(): JsonResponse
    {
        return $this->noContent();
    }

    public function callError(string $message = 'Something went wrong.', int $status = 500, mixed $errors = null): JsonResponse
    {
        return $this->error($message, $status, $errors);
    }

    public function callNotFound(string $message = 'Resource not found.'): JsonResponse
    {
        return $this->notFound($message);
    }

    public function callUnauthorized(string $message = 'Unauthorized.'): JsonResponse
    {
        return $this->unauthorized($message);
    }

    public function callForbidden(string $message = 'Forbidden.'): JsonResponse
    {
        return $this->forbidden($message);
    }

    public function callValidationError(ValidationException|array $exception): JsonResponse
    {
        return $this->validationError($exception);
    }

    public function callPaginated(LengthAwarePaginator $paginator): JsonResponse
    {
        return $this->paginated($paginator);
    }

    public function callRedirect(string $url, int $status = 302): RedirectResponse
    {
        return $this->redirect($url, $status);
    }
}
