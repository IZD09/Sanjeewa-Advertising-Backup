<?php

namespace Modules\User\Models;

use Database\Factories\SystemModuleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SystemModule extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'system_modules';

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
        'system_module',
    ];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): SystemModuleFactory
    {
        return SystemModuleFactory::new();
    }

    /**
     * Get the users assigned to this system module.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'system_modules_has_users', 'system_modules_id', 'users_id')
            ->using(SystemModuleUser::class)
            ->withPivot(['view', 'create', 'edit', 'delete', 'export']);
    }

    /**
     * Get the user permissions associated with this system module.
     */
    public function userPermissions(): HasMany
    {
        return $this->hasMany(SystemModuleUser::class, 'system_modules_id', 'id');
    }
}
