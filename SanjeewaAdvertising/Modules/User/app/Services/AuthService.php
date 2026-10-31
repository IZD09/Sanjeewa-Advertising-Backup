<?php

namespace Modules\User\Services;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Hash;
use Modules\User\Models\User;
use Modules\User\Models\UserLogin;
use Modules\User\Models\UserStatus;

class AuthService
{
    /**
     * Register a new user in the database with encrypted (hashed) password.
     *
     * @param  array<string, mixed>  $data
     */
    public function register(array $data): User
    {
        $statusId = $data['user_statuses_id'] ?? null;

        if (! $statusId) {
            $defaultStatus = UserStatus::query()->first();
            $statusId = $defaultStatus ? $defaultStatus->id : 1;
        }

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
            'user_statuses_id' => (int) $statusId,
        ])->load('status');
    }

    /**
     * Authenticate user credentials and create a login tracking record.
     *
     * @return array{user: User, login_id: int, login_at: mixed}|null
     */
    public function authenticate(string $identifier, string $password): ?array
    {
        $user = User::query()
            ->with('status')
            ->where('username', $identifier)
            ->orWhere('mobile', $identifier)
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        // Record user login session in user_login table
        $userLogin = UserLogin::create([
            'user_id' => $user->id,
            'login' => now(),
            'logout' => null,
        ]);

        // Update is_login flag
        $user->update(['is_login' => 1]);

        return [
            'user' => $user,
            'login_id' => $userLogin->id,
            'login_at' => $userLogin->login,
        ];
    }

    /**
     * Terminate the user session and record logout time.
     */
    public function logout(Authenticatable|User|null $user): bool
    {
        if (! $user) {
            return false;
        }

        $userId = $user->getAuthIdentifier();

        if ($user instanceof User) {
            $user->update(['is_login' => 0]);
        } else {
            User::query()->where('id', $userId)->update(['is_login' => 0]);
        }

        // Close the latest open user_login record
        UserLogin::query()
            ->where('user_id', $userId)
            ->whereNull('logout')
            ->latest('id')
            ->first()
            ?->update(['logout' => now()]);

        return true;
    }

    /**
     * Change user password after checking the current password.
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (! Hash::check($currentPassword, $user->password)) {
            return false;
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return true;
    }
}
