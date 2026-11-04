<?php

namespace Modules\User\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Modules\Core\Models\UserActivity;
use Modules\PrintJob\Models\PrintJob;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'mobile',
        'register_at',
        'username',
        'password',
        'is_login',
        'user_statuses_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'register_at' => 'datetime',
            'password' => 'hashed',
            'is_login' => 'boolean',
            'user_statuses_id' => 'integer',
        ];
    }

    /**
     * Get the status of the user.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(UserStatus::class, 'user_statuses_id', 'id');
    }

    /**
     * Get the login history records for the user.
     */
    public function logins(): HasMany
    {
        return $this->hasMany(UserLogin::class, 'user_id', 'id');
    }

    /**
     * Get the activities logged for this user.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(UserActivity::class, 'users_id', 'id');
    }

    /**
     * Get the print jobs created by the user.
     */
    public function printJobs(): HasMany
    {
        return $this->hasMany(PrintJob::class, 'users_id', 'id');
    }

    /**
     * Get the system modules assigned to the user.
     */
    public function systemModules(): BelongsToMany
    {
        return $this->belongsToMany(SystemModule::class, 'system_modules_has_users', 'users_id', 'system_modules_id')
            ->using(SystemModuleUser::class)
            ->withPivot('permision_stateses_id');
    }

    /**
     * Get the permission assignments for the user.
     */
    public function userPermissions(): HasMany
    {
        return $this->hasMany(SystemModuleUser::class, 'users_id', 'id');
    }

    /**
     * Normalize module name to match system_modules database record.
     */
    public function normalizeModuleName(string $module): string
    {
        $normalized = str_replace(['_', '-'], ' ', strtolower(trim($module)));

        $map = [
            'dashboard' => 'Dashboard',
            'print jobs' => 'Print Jobs',
            'design management' => 'Design Management',
            'design mgmt' => 'Design Management',
            'place order' => 'Place Order',
            'customers' => 'Customers',
            'quotations & invoices' => 'Quotations & Invoices',
            'quotations invoices' => 'Quotations & Invoices',
            'inventory' => 'Inventory',
            'grn & purchase orders' => 'GRN & Purchase Orders',
            'grn purchase orders' => 'GRN & Purchase Orders',
            'grn' => 'GRN & Purchase Orders',
            'purchase orders' => 'GRN & Purchase Orders',
            'payments & financials' => 'Payments & Financials',
            'payments financials' => 'Payments & Financials',
            'payments' => 'Payments & Financials',
            'reports' => 'Reports',
            'user control' => 'User Control',
            'settings' => 'Settings',
        ];

        return $map[$normalized] ?? $module;
    }

    /**
     * Check if the user is authorized to access a system module.
     */
    public function canAccessModule(string|int $module): bool
    {
        // Inactive or suspended users cannot access any module
        if ((int) $this->user_statuses_id !== 1) {
            return false;
        }

        // Default admin has full superuser access
        if ($this->username === 'admin') {
            return true;
        }

        $query = SystemModuleUser::query()->where('users_id', $this->id);

        if (is_int($module)) {
            $query->where('system_modules_id', $module);
        } else {
            $normalizedName = $this->normalizeModuleName($module);
            $query->whereHas('systemModule', function ($q) use ($normalizedName, $module) {
                $q->where('system_module', $normalizedName)
                    ->orWhere('system_module', $module);
            });
        }

        /** @var SystemModuleUser|null $assignment */
        $assignment = $query->with('permisionState')->first();

        if (! $assignment || ! $assignment->permisionState) {
            return false;
        }

        // Denied permission state prevents access
        if ($assignment->permisionState->permision_states === 'Denied' || (int) $assignment->permision_stateses_id === 4) {
            return false;
        }

        return true;
    }
}
