<?php

namespace Modules\HR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkDayStatus extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'work_day_statuses';

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
        'work_day_status',
    ];

    /**
     * Get the work days with this status.
     */
    public function workDays(): HasMany
    {
        return $this->hasMany(WorkDay::class, 'work_day_statuses_id', 'id');
    }
}
