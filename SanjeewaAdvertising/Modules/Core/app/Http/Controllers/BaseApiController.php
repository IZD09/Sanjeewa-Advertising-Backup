<?php

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

abstract class BaseApiController extends Controller
{
    /**
     * Return a successful API response.
     *
     * @param  array<string, string>  $headers
     */
    protected function success(
        mixed $data = null,
        string $message = 'Success.',
        int $status = 200,
        array $headers = []
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status, $headers);
    }

    /**
     * Return a successful resource creation response.
     *
     * @param  array<string, string>  $headers
     */
    protected function created(
        mixed $data = null,
        string $message = 'Created successfully.',
        array $headers = []
    ): JsonResponse {
        return $this->success(
            $data,
            $message,
            201,
            $headers
        );
    }

    /**
     * Return a successful response without any content.
     *
     * @param  array<string, string>  $headers
     */
    protected function noContent(array $headers = []): JsonResponse
    {
        return response()->json(null, 204, $headers);
    }

    /**
     * Return an error API response.
     *
     * @param  array<string, string>  $headers
     */
    protected function error(
        string $message = 'Something went wrong.',
        int $status = 500,
        mixed $errors = null,
        array $headers = []
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status, $headers);
    }

    /**
     * Return a not found API response (404).
     */
    protected function notFound(
        string $message = 'Resource not found.',
        mixed $errors = null
    ): JsonResponse {
        return $this->error(
            $message,
            404,
            $errors
        );
    }

    /**
     * Return an unauthorized API response (401).
     */
    protected function unauthorized(
        string $message = 'Unauthorized.',
        mixed $errors = null
    ): JsonResponse {
        return $this->error(
            $message,
            401,
            $errors
        );
    }

    /**
     * Return a forbidden API response (403).
     */
    protected function forbidden(
        string $message = 'Forbidden.',
        mixed $errors = null
    ): JsonResponse {
        return $this->error(
            $message,
            403,
            $errors
        );
    }

    /**
     * Return a validation error API response (422).
     *
     * @param  ValidationException|array<string, mixed>  $exception
     */
    protected function validationError(
        ValidationException|array $exception,
        string $message = 'The given data was invalid.'
    ): JsonResponse {
        $errors = $exception instanceof ValidationException
            ? $exception->errors()
            : $exception;

        return $this->error(
            $message,
            422,
            $errors
        );
    }

    /**
     * Return a paginated resource API response.
     */
    protected function paginated(
        LengthAwarePaginator $paginator,
        string $message = 'Success.'
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginator->items(),
            'pagination' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'has_more_pages' => $paginator->hasMorePages(),
            ],
        ], 200);
    }

    /**
     * Redirect the request to the given URL.
     *
     * @param  array<string, string>  $headers
     */
    protected function redirect(
        string $url,
        int $status = 302,
        array $headers = []
    ): RedirectResponse {
        return redirect()->to($url, $status, $headers);
    }
}
