<?php

namespace Modules\Admin\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Http\Requests\ChangeAdminStatusRequest;
use Modules\Admin\Http\Requests\StoreAdminRequest;
use Modules\Admin\Http\Requests\UpdateAdminRequest;
use Modules\Admin\Models\Admin;
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
    ) {
    }

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
    public function search(Request $request): JsonResponse
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
        $actingAdminId = Auth::guard('admin')->id() ? (int) Auth::guard('admin')->id() : null;
        $admin = $this->adminService->createAdmin($request->validated(), $actingAdminId);

        return $this->created(
            new AdminResource($admin),
            'Admin created successfully.'
        );
    }

    /**
     * Display the specified admin details.
     */
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
    }

    /**
     * Update the specified admin in storage.
     */
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

        $actingAdminId = Auth::guard('admin')->id() ? (int) Auth::guard('admin')->id() : null;
        $updatedAdmin = $this->adminService->updateAdminStatus(
            $admin,
            $request->integer('admin_statuses_id'),
            $actingAdminId
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
    }

    /**
     * Verify credentials to access or unlock the admin profile panel.
     */
    public function verifyProfileAccess(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $username = trim((string) $validated['username']);
        $password = (string) $validated['password'];

        $currentAdmin = Auth::guard('admin')->user();

        // If authenticated as admin, prioritize verifying against current admin or matching username
        /** @var Admin|null $admin */
        $admin = Admin::query()
            ->with(['status', 'type', 'logins' => fn ($q) => $q->latest('id')->limit(10)])
            ->where(function ($q) use ($username) {
                $q->where('username', $username)
                    ->orWhere('email', $username)
                    ->orWhere('mobile', $username);
            })
            ->first();

        if (! $admin || ! Hash::check($password, $admin->password)) {
            return $this->unauthorized('Invalid username or password.');
        }

        // Check if admin is active
        if ((int) ($admin->admin_statuses_id ?? 1) !== 1) {
            return $this->forbidden('Administrator account is inactive or locked.');
        }

        return $this->success([
            'admin' => new AdminResource($admin),
            'verified' => true,
        ], 'Credentials verified successfully.');
    }

    /**
     * Retrieve the authenticated admin profile details.
     */
    public function profile(Request $request): JsonResponse
    {
        /** @var Admin|null $admin */
        $admin = Auth::guard('admin')->user();

        if (! $admin) {
            // Check fallback by username if queried
            $username = $request->query('username');
            if ($username) {
                $admin = Admin::where('username', $username)->first();
            }
        }

        if (! $admin) {
            return $this->unauthorized('Administrator session required.');
        }

        $admin->load(['status', 'type', 'logins' => fn ($q) => $q->latest('id')->limit(10)]);

        return $this->success(
            new AdminResource($admin),
            'Admin profile retrieved successfully.'
        );
    }

    /**
     * Update authenticated administrator profile details.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        /** @var Admin|null $admin */
        $admin = Auth::guard('admin')->user();

        if (! $admin) {
            $username = $request->input('target_username');
            if ($username) {
                $admin = Admin::where('username', $username)->first();
            }
        }

        if (! $admin) {
            return $this->unauthorized('Administrator session required.');
        }

        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:50'],
            'last_name' => ['sometimes', 'required', 'string', 'max:50'],
            'email' => ['sometimes', 'required', 'email', 'max:100', 'unique:admins,email,' . $admin->id],
            'mobile' => ['sometimes', 'required', 'string', 'max:15', 'unique:admins,mobile,' . $admin->id],
            'current_password' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'max:255', 'confirmed'],
        ]);

        if (! empty($validated['password'])) {
            if (empty($validated['current_password']) || ! Hash::check($validated['current_password'], $admin->password)) {
                return $this->error('Current password is incorrect.', 422);
            }
        }

        $updateData = [
            'first_name' => $validated['first_name'] ?? $admin->first_name,
            'last_name' => $validated['last_name'] ?? $admin->last_name,
            'email' => $validated['email'] ?? $admin->email,
            'mobile' => $validated['mobile'] ?? $admin->mobile,
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = $validated['password'];
        }

        $updated = $this->adminService->updateAdmin($admin, $updateData, $admin->id);

        return $this->success(
            new AdminResource($updated),
            'Admin profile updated successfully.'
        );
    }
}
