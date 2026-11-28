<?php

namespace Modules\Transport\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\HR\Models\Staff;

class StaffType extends Model
{
    /**
     * @var string
     */
    protected $table = 'staff_type';

    /**
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * @var bool
     */
    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'staff_type',
    ];

    /**
     * Get the staff members belonging to this staff type.
     */
    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class, 'staff_type_id', 'id');
    }
}
