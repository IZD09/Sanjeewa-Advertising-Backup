<?php

namespace Modules\HR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Admin\Models\Admin;
use Modules\Transport\Models\StaffType;
use Modules\Transport\Models\Transport;

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
        'staff_type_id',
        'add_at',
        'add_by',
    ];

    /**
     * Ensure default staff_type_id is populated when omitted.
     */
    protected static function booted(): void
    {
        static::creating(function (Staff $staff): void {
            if (empty($staff->staff_type_id)) {
                $defaultType = StaffType::firstOrCreate(['staff_type' => 'General Staff']);
                $staff->staff_type_id = $defaultType->id;
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'staff_statuses_id' => 'integer',
            'staff_type_id' => 'integer',
            'add_at' => 'datetime',
            'add_by' => 'integer',
        ];
    }

    /**
     * Get the staff type of the staff member.
     */
    public function staffType(): BelongsTo
    {
        return $this->belongsTo(StaffType::class, 'staff_type_id', 'id');
    }

    /**
     * Get the transport trips assigned to this staff member.
     */
    public function transports(): HasMany
    {
        return $this->hasMany(Transport::class, 'staff_id', 'id');
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

    /**
     * Get the attendance records for this staff member.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Atendance::class, 'staff_id', 'id');
    }
}
