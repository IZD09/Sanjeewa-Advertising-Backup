<?php

namespace Modules\User\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Modules\Core\Models\UserActivity;
use Modules\PrintJob\Models\PrintJob;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users';

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
        'first_name',
        'last_name',
        'mobile',
        'register_at',
        'username',
        'password',
        'is_login',
        'user_statuses_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'register_at' => 'datetime',
            'password' => 'hashed',
            'is_login' => 'boolean',
            'user_statuses_id' => 'integer',
        ];
    }

    /**
     * Get the status of the user.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(UserStatus::class, 'user_statuses_id', 'id');
    }

    /**
     * Get the login history records for the user.
     */
    public function logins(): HasMany
    {
        return $this->hasMany(UserLogin::class, 'user_id', 'id');
    }

    /**
     * Get the activities logged for this user.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(UserActivity::class, 'users_id', 'id');
    }

    /**
     * Get the print jobs created by the user.
     */
    public function printJobs(): HasMany
    {
        return $this->hasMany(PrintJob::class, 'users_id', 'id');
    }
}
