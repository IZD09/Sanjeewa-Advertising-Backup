<?php

namespace Modules\Admin\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Admin extends Authenticatable
{
    use Notifiable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'admins';

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
        'username',
        'password',
        'mobile',
        'email',
        'add_time',
        'is_log',
        'admin_statuses_id',
        'admin_types_id',
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
            'add_time' => 'datetime',
            'password' => 'hashed',
            'is_log' => 'boolean',
            'admin_statuses_id' => 'integer',
            'admin_types_id' => 'integer',
        ];
    }

    /**
     * Get the status of the admin.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(AdminStatus::class, 'admin_statuses_id', 'id');
    }

    /**
     * Get the type/role of the admin.
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(AdminType::class, 'admin_types_id', 'id');
    }

    /**
     * Get the login records for the admin.
     */
    public function logins(): HasMany
    {
        return $this->hasMany(AdminLogin::class, 'admins_id', 'id');
    }

    /**
     * Get the activities logged for this admin.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(AdminActivity::class, 'admins_id', 'id');
    }

    /**
     * Check if the administrator can access a system module.
     */
    public function canAccessModule(string|int $module): bool
    {
        return (int) $this->admin_statuses_id === 1;
    }
}
