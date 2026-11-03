<?php

namespace Modules\User\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class SystemModuleUser extends Pivot
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'system_modules_has_users';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

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
        'system_modules_id',
        'users_id',
        'permision_stateses_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'system_modules_id' => 'integer',
            'users_id' => 'integer',
            'permision_stateses_id' => 'integer',
        ];
    }

    /**
     * Get the system module for this permission assignment.
     */
    public function systemModule(): BelongsTo
    {
        return $this->belongsTo(SystemModule::class, 'system_modules_id', 'id');
    }

    /**
     * Get the user for this permission assignment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'users_id', 'id');
    }

    /**
     * Get the permission state for this permission assignment.
     */
    public function permisionState(): BelongsTo
    {
        return $this->belongsTo(PermisionState::class, 'permision_stateses_id', 'id');
    }
}
