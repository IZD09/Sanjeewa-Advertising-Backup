<?php

namespace Modules\HR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Atendance extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'atendance';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'work_days_id';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the primary key.
     *
     * @var string
     */
    protected $keyType = 'int';

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
        'work_days_id',
        'staff_id',
        'atendance_statuses_id',
        'in',
        'out',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'work_days_id' => 'integer',
            'staff_id' => 'integer',
            'atendance_statuses_id' => 'integer',
        ];
    }

    /**
     * Get the work day associated with this attendance record.
     */
    public function workDay(): BelongsTo
    {
        return $this->belongsTo(WorkDay::class, 'work_days_id', 'id');
    }

    /**
     * Get the staff member associated with this attendance record.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id', 'id');
    }

    /**
     * Get the attendance status associated with this attendance record.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(AtendanceStatus::class, 'atendance_statuses_id', 'id');
    }
}
