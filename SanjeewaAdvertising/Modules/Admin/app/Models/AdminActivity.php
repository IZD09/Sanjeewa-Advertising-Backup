<?php

namespace Modules\Admin\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Core\Models\Activity;

class AdminActivity extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'admin_activities';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'activities_id';

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
        'activities_id',
        'admins_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'activities_id' => 'integer',
            'admins_id' => 'integer',
        ];
    }

    /**
     * Get the underlying activity record.
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'activities_id', 'id');
    }

    /**
     * Get the admin who performed the activity.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'admins_id', 'id');
    }
}
