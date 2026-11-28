<?php

namespace Modules\Transport\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleModel extends Model
{
    /**
     * @var string
     */
    protected $table = 'model';

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
        'mane',
    ];

    /**
     * Get the trucks of this vehicle model.
     */
    public function trucks(): HasMany
    {
        return $this->hasMany(Truck::class, 'model_id', 'id');
    }
}
