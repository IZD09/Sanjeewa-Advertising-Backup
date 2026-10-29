<?php

namespace Modules\PrintJob\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrintJobStatusHistory extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'print_job_status_history';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'print_jobs_id';

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
        'print_jobs_id',
        'print_job_statuses_id',
        'update_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'print_jobs_id' => 'integer',
            'print_job_statuses_id' => 'integer',
            'update_at' => 'datetime',
        ];
    }

    /**
     * Get the print job associated with this history record.
     */
    public function printJob(): BelongsTo
    {
        return $this->belongsTo(PrintJob::class, 'print_jobs_id', 'id');
    }

    /**
     * Get the status associated with this history record.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(PrintJobStatus::class, 'print_job_statuses_id', 'id');
    }
}
