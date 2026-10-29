<?php

namespace Modules\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Modules\Admin\Models\AdminActivity;

class Activity extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'activities';

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
        'activity_time',
        'user_or_admin',
        'activity',
        'activity_types_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'activity_time' => 'datetime',
            'user_or_admin' => 'integer',
            'activity' => 'array',
            'activity_types_id' => 'integer',
        ];
    }

    /**
     * Get the activity type.
     */
    public function activityType(): BelongsTo
    {
        return $this->belongsTo(ActivityType::class, 'activity_types_id', 'id');
    }

    /**
     * Get the admin activity association, if performed by an admin.
     */
    public function adminActivity(): HasOne
    {
        return $this->hasOne(AdminActivity::class, 'activities_id', 'id');
    }

    /**
     * Get the user activity association, if performed by a regular user.
     */
    public function userActivity(): HasOne
    {
        return $this->hasOne(UserActivity::class, 'activities_id', 'id');
    }
}
