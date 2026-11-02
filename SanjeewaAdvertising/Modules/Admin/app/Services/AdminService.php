<?php

namespace Modules\Admin\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\Admin;
use Modules\Admin\Models\AdminLogin;
use Modules\Admin\Models\AdminStatus;
use Modules\Admin\Models\AdminType;

class AdminService
{
    /**
     * Build the query for admins with search and filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Admin>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = Admin::query()->with(['status', 'type']);

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where(function (Builder $q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['admin_statuses_id'])) {
            $query->where('admin_statuses_id', (int) $filters['admin_statuses_id']);
        }

        if (! empty($filters['admin_types_id'])) {
            $query->where('admin_types_id', (int) $filters['admin_types_id']);
        }

        $sortBy = (string) ($filters['sort_by'] ?? 'id');
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'first_name', 'last_name', 'username', 'mobile', 'email', 'add_time'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderByDesc('id');
        }

        return $query;
    }

    /**
     * Retrieve all admins matching criteria without pagination limit.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Admin>
     */
    public function getAllAdmins(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated admins.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getAdmins(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find an admin by ID with relations.
     */
    public function getAdminById(int $id): ?Admin
    {
        return Admin::query()
            ->with([
                'status',
                'type',
                'logins' => fn ($q) => $q->latest('id')->limit(10),
            ])
            ->find($id);
    }

    /**
     * Create a new admin.
     *
     * @param  array<string, mixed>  $data
     */
    public function createAdmin(array $data): Admin
    {
        $password = (string) ($data['password'] ?? '');
        if (Hash::info($password)['algo'] === null) {
            $password = Hash::make($password);
        }

        return Admin::create([
            'first_name' => trim((string) ($data['first_name'] ?? '')),
            'last_name' => trim((string) ($data['last_name'] ?? '')),
            'username' => trim((string) ($data['username'] ?? '')),
            'password' => $password,
            'mobile' => trim((string) ($data['mobile'] ?? '')),
            'email' => trim((string) ($data['email'] ?? '')),
            'add_time' => now(),
            'is_log' => 0,
            'admin_statuses_id' => (int) ($data['admin_statuses_id'] ?? 1),
            'admin_types_id' => (int) ($data['admin_types_id'] ?? 1),
        ])->load(['status', 'type']);
    }

    /**
     * Update an existing admin.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateAdmin(Admin $admin, array $data): Admin
    {
        $attributes = [];

        if (isset($data['first_name'])) {
            $attributes['first_name'] = trim((string) $data['first_name']);
        }
        if (isset($data['last_name'])) {
            $attributes['last_name'] = trim((string) $data['last_name']);
        }
        if (isset($data['username'])) {
            $attributes['username'] = trim((string) $data['username']);
        }
        if (! empty($data['password'])) {
            $password = (string) $data['password'];
            if (Hash::info($password)['algo'] === null) {
                $password = Hash::make($password);
            }
            $attributes['password'] = $password;
        }
        if (isset($data['mobile'])) {
            $attributes['mobile'] = trim((string) $data['mobile']);
        }
        if (isset($data['email'])) {
            $attributes['email'] = trim((string) $data['email']);
        }
        if (isset($data['admin_statuses_id'])) {
            $attributes['admin_statuses_id'] = (int) $data['admin_statuses_id'];
        }
        if (isset($data['admin_types_id'])) {
            $attributes['admin_types_id'] = (int) $data['admin_types_id'];
        }

        $admin->update($attributes);

        return $admin->fresh(['status', 'type']);
    }

    /**
     * Delete an admin record.
     */
    public function deleteAdmin(Admin $admin): bool
    {
        return (bool) $admin->delete();
    }

    /**
     * Update admin status.
     */
    public function updateAdminStatus(Admin $admin, int $statusId): Admin
    {
        $admin->update([
            'admin_statuses_id' => $statusId,
        ]);

        return $admin->fresh(['status', 'type']);
    }

    /**
     * Get paginated login history for an admin.
     */
    public function getAdminLogins(int $adminId, int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return AdminLogin::query()
            ->where('admins_id', $adminId)
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * Retrieve all admin statuses.
     *
     * @return Collection<int, AdminStatus>
     */
    public function getAllStatuses(): Collection
    {
        return AdminStatus::query()->orderBy('id')->get();
    }

    /**
     * Retrieve all admin types.
     *
     * @return Collection<int, AdminType>
     */
    public function getAllTypes(): Collection
    {
        return AdminType::query()->orderBy('id')->get();
    }
}
