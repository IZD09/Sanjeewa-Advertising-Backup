<?php

namespace Modules\HR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Admin\Models\Admin;

class Staff extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'staff';

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
        'nic',
        'staff_statuses_id',
        'add_at',
        'add_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'staff_statuses_id' => 'integer',
            'add_at' => 'datetime',
            'add_by' => 'integer',
        ];
    }

    /**
     * Get the status of the staff member.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(StaffStatus::class, 'staff_statuses_id', 'id');
    }

    /**
     * Get the administrator who added this staff member.
     */
    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'add_by', 'id');
    }

    /**
     * Get the salary records for this staff member.
     */
    public function salaries(): HasMany
    {
        return $this->hasMany(Salary::class, 'staff_id', 'id');
    }

    /**
     * Get the daily salary payment records for this staff member.
     */
    public function dailySalaries(): HasMany
    {
        return $this->hasMany(DalySalary::class, 'staff_id', 'id');
    }
}
