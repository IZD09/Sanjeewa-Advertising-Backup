<?php

namespace Modules\Transport\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\HR\Models\Staff;
use Modules\PrintJob\Models\PrintJob;

class Transport extends Model
{
    /**
     * @var string
     */
    protected $table = 'transport';

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
        'start',
        'end',
        'start_km',
        'end_km',
        'desial_price_id',
        'truck_id',
        'staff_id',
        'junry',
        'destination',
        'diesel_liters',
        'diesel_cost',
        'print_jobs_id',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start' => 'datetime',
            'end' => 'datetime',
            'start_km' => 'integer',
            'end_km' => 'integer',
            'desial_price_id' => 'integer',
            'truck_id' => 'integer',
            'staff_id' => 'integer',
            'junry' => 'integer',
            'diesel_liters' => 'float',
            'diesel_cost' => 'float',
            'print_jobs_id' => 'integer',
        ];
    }

    /**
     * Get the diesel price record associated with this transport trip.
     */
    public function desialPrice(): BelongsTo
    {
        return $this->belongsTo(DesialPrice::class, 'desial_price_id', 'id');
    }

    /**
     * Get the truck used for this transport trip.
     */
    public function truck(): BelongsTo
    {
        return $this->belongsTo(Truck::class, 'truck_id', 'id');
    }

    /**
     * Get the staff member (driver) assigned to this transport trip.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id', 'id');
    }

    /**
     * Get the print job linked to this delivery trip, if any.
     */
    public function printJob(): BelongsTo
    {
        return $this->belongsTo(PrintJob::class, 'print_jobs_id', 'id');
    }
}
