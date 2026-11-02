<?php

namespace Modules\Admin\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Admin\Http\Requests\ChangeAdminStatusRequest;
use Modules\Admin\Http\Requests\StoreAdminRequest;
use Modules\Admin\Http\Requests\UpdateAdminRequest;
use Modules\Admin\Services\AdminService;
use Modules\Admin\Transformers\AdminLoginResource;
use Modules\Admin\Transformers\AdminResource;
use Modules\Admin\Transformers\AdminStatusResource;
use Modules\Admin\Transformers\AdminTypeResource;
use Modules\Core\Http\Controllers\BaseApiController;

class AdminController extends BaseApiController
{
    public function __construct(
        protected AdminService $adminService
    ) {}

    /**
     * Display a listing of admins with optional search and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $admins = $this->adminService->getAllAdmins($request->query());

            return $this->success(
                AdminResource::collection($admins),
                'All admins retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $admins = $this->adminService->getAdmins($request->query(), $perPage);

        $admins->through(fn ($admin) => new AdminResource($admin));

        return $this->paginated($admins, 'Admins retrieved successfully.');
    }

    /**
     * Retrieve all admins without pagination limit.
     */
    public function all(Request $request): JsonResponse
    {
        $admins = $this->adminService->getAllAdmins($request->query());

        return $this->success(
            AdminResource::collection($admins),
            'All admins retrieved successfully.'
        );
    }

    /**
     * Search admins across name, username, mobile, and email.
     */
<<<<<<< HEAD
    public function search(Request $request): JsonResponse
=======
    public function store(Request $request)
    {
    }

    /**
     * Show the specified resource.
     */
    public function show($id)
>>>>>>> origin/Ardithya
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $admins = $this->adminService->getAllAdmins($request->query());

            return $this->success(
                AdminResource::collection($admins),
                'Admins search results.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $admins = $this->adminService->getAdmins($request->query(), $perPage);

        $admins->through(fn ($admin) => new AdminResource($admin));

        return $this->paginated($admins, 'Admins search results.');
    }

    /**
     * Store a newly created admin in storage.
     */
    public function store(StoreAdminRequest $request): JsonResponse
    {
        $admin = $this->adminService->createAdmin($request->validated());

        return $this->created(
            new AdminResource($admin),
            'Admin created successfully.'
        );
    }

    /**
     * Display the specified admin details.
     */
<<<<<<< HEAD
    public function show(int $id): JsonResponse
    {
        $admin = $this->adminService->getAdminById($id);

        if (! $admin) {
            return $this->notFound('Admin not found.');
        }

        return $this->success(
            new AdminResource($admin),
            'Admin details retrieved successfully.'
        );
=======
    public function update(Request $request, $id)
    {
>>>>>>> origin/Ardithya
    }

    /**
     * Update the specified admin in storage.
     */
<<<<<<< HEAD
    public function update(UpdateAdminRequest $request, int $id): JsonResponse
    {
        $admin = $this->adminService->getAdminById($id);

        if (! $admin) {
            return $this->notFound('Admin not found.');
        }

        $updatedAdmin = $this->adminService->updateAdmin($admin, $request->validated());

        return $this->success(
            new AdminResource($updatedAdmin),
            'Admin updated successfully.'
        );
    }

    /**
     * Remove the specified admin from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $admin = $this->adminService->getAdminById($id);

        if (! $admin) {
            return $this->notFound('Admin not found.');
        }

        $this->adminService->deleteAdmin($admin);

        return $this->success(null, 'Admin deleted successfully.');
    }

    /**
     * Update admin status.
     */
    public function updateStatus(ChangeAdminStatusRequest $request, int $id): JsonResponse
    {
        $admin = $this->adminService->getAdminById($id);

        if (! $admin) {
            return $this->notFound('Admin not found.');
        }

        $updatedAdmin = $this->adminService->updateAdminStatus(
            $admin,
            $request->integer('admin_statuses_id')
        );

        return $this->success(
            new AdminResource($updatedAdmin),
            'Admin status updated successfully.'
        );
    }

    /**
     * Get login history for the specified admin.
     */
    public function logins(Request $request, int $id): JsonResponse
    {
        $admin = $this->adminService->getAdminById($id);

        if (! $admin) {
            return $this->notFound('Admin not found.');
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $logins = $this->adminService->getAdminLogins($id, $perPage);

        $logins->through(fn ($item) => new AdminLoginResource($item));

        return $this->paginated($logins, 'Admin login history retrieved successfully.');
    }

    /**
     * Get all admin statuses.
     */
    public function statuses(): JsonResponse
    {
        $statuses = $this->adminService->getAllStatuses();

        return $this->success(
            AdminStatusResource::collection($statuses),
            'Admin statuses retrieved successfully.'
        );
    }

    /**
     * Get all admin types / roles.
     */
    public function types(): JsonResponse
    {
        $types = $this->adminService->getAllTypes();

        return $this->success(
            AdminTypeResource::collection($types),
            'Admin types retrieved successfully.'
        );
=======
    public function destroy($id)
    {
>>>>>>> origin/Ardithya
    }
}
