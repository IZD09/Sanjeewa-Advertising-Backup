<?php

namespace Modules\User\Models;

use Database\Factories\PermisionStateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PermisionState extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'permision_stateses';

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
        'permision_states',
    ];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): PermisionStateFactory
    {
        return PermisionStateFactory::new();
    }

    /**
     * Get the user permissions with this permission state.
     */
    public function userPermissions(): HasMany
    {
        return $this->hasMany(SystemModuleUser::class, 'permision_stateses_id', 'id');
    }
}
