<?php

namespace Modules\HR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkDay extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'work_days';

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
        'date',
        'work_day_statuses_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'work_day_statuses_id' => 'integer',
        ];
    }

    /**
     * Get the status of the work day.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(WorkDayStatus::class, 'work_day_statuses_id', 'id');
    }

    /**
     * Get the attendance records for this work day.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Atendance::class, 'work_days_id', 'id');
    }
}
