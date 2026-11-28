<?php

namespace Modules\Transport\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\HR\Models\Staff;

class Truck extends Model
{
    /**
     * @var string
     */
    protected $table = 'truck';

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
        'register',
        'model_id',
        'default_staff_id',
        'current_km',
        'fuel_efficiency',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'model_id' => 'integer',
            'default_staff_id' => 'integer',
            'current_km' => 'integer',
            'fuel_efficiency' => 'float',
        ];
    }

    /**
     * Get the vehicle model for this truck.
     */
    public function vehicleModel(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'model_id', 'id');
    }

    /**
     * Get the default driver assigned to this truck.
     */
    public function defaultDriver(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'default_staff_id', 'id');
    }

    /**
     * Get the transport trips recorded for this truck.
     */
    public function transports(): HasMany
    {
        return $this->hasMany(Transport::class, 'truck_id', 'id');
    }
}
