<?php

namespace Modules\User\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;
use Modules\User\Models\User;
use Modules\User\Models\UserLogin;

class UserService
{
    /**
     * Build the query for users with search and filter criteria.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<User>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = User::query()->with('status');

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where(function (Builder $q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhereHas('status', function (Builder $sq) use ($search) {
                        $sq->where('user_status', 'like', "%{$search}%");
                    });

                // Support multi-word name searches (e.g. "Kamal Silva")
                $terms = array_filter(explode(' ', $search));
                if (count($terms) > 1) {
                    $q->orWhere(function (Builder $subQ) use ($terms) {
                        foreach ($terms as $term) {
                            $subQ->where(function (Builder $w) use ($term) {
                                $w->where('first_name', 'like', "%{$term}%")
                                    ->orWhere('last_name', 'like', "%{$term}%")
                                    ->orWhere('username', 'like', "%{$term}%")
                                    ->orWhere('mobile', 'like', "%{$term}%");
                            });
                        }
                    });
                }
            });
        }

        if (! empty($filters['user_statuses_id'])) {
            $query->where('user_statuses_id', (int) $filters['user_statuses_id']);
        }

        if (isset($filters['is_login']) && $filters['is_login'] !== '') {
            $query->where('is_login', filter_var($filters['is_login'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = (string) ($filters['sort_by'] ?? 'id');
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'first_name', 'last_name', 'username', 'mobile', 'register_at'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderByDesc('id');
        }

        return $query;
    }

    /**
     * Retrieve ALL users matching search/filter criteria without pagination limit.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, User>
     */
    public function getAllUsers(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve a paginated list of users based on filter criteria.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getUsers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Create a new user record with encrypted (hashed) password.
     *
     * @param  array<string, mixed>  $data
     */
    public function createUser(array $data): User
    {
        $password = (string) ($data['password'] ?? '');

        // Encrypt password using bcrypt if not already hashed
        if (Hash::info($password)['algo'] === null) {
            $password = Hash::make($password);
        }

        return User::create([
            'first_name' => trim((string) ($data['first_name'] ?? '')),
            'last_name' => trim((string) ($data['last_name'] ?? '')),
            'mobile' => trim((string) ($data['mobile'] ?? '')),
            'username' => trim((string) ($data['username'] ?? '')),
            'password' => $password,
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => (int) ($data['user_statuses_id'] ?? 1),
        ])->load('status');
    }

    /**
     * Find a user by primary key with relations.
     */
    public function getUserById(int $id): ?User
    {
        return User::query()
            ->with([
                'status',
                'logins' => fn ($q) => $q->latest('id')->limit(10),
            ])
            ->find($id);
    }

    /**
     * Update an existing user's information.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateUser(User $user, array $data): User
    {
        $attributes = [];

        if (isset($data['first_name'])) {
            $attributes['first_name'] = trim((string) $data['first_name']);
        }
        if (isset($data['last_name'])) {
            $attributes['last_name'] = trim((string) $data['last_name']);
        }
        if (isset($data['mobile'])) {
            $attributes['mobile'] = trim((string) $data['mobile']);
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
        if (isset($data['user_statuses_id'])) {
            $attributes['user_statuses_id'] = (int) $data['user_statuses_id'];
        }

        $user->update($attributes);

        return $user->fresh('status');
    }

    /**
     * Delete a user record.
     */
    public function deleteUser(User $user): bool
    {
        return (bool) $user->delete();
    }

    /**
     * Update user status.
     */
    public function updateUserStatus(User $user, int $statusId): User
    {
        $user->update([
            'user_statuses_id' => $statusId,
        ]);

        return $user->fresh('status');
    }

    /**
     * Get paginated login history for a given user ID.
     */
    public function getUserLogins(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return UserLogin::query()
            ->where('user_id', $userId)
            ->orderByDesc('id')
            ->paginate($perPage);
    }
}
