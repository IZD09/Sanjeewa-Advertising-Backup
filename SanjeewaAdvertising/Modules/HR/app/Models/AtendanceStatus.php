<?php

namespace Modules\HR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AtendanceStatus extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'atendance_statuses';

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
        'atendance_statuses',
    ];

    /**
     * Get the attendance records with this status.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Atendance::class, 'atendance_statuses_id', 'id');
    }
}
