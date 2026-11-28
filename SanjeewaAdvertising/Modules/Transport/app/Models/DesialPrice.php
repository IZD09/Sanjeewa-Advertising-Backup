<?php

namespace Modules\Transport\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DesialPrice extends Model
{
    /**
     * @var string
     */
    protected $table = 'desial_price';

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
        'price',
        'add_date',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'add_date' => 'date',
        ];
    }

    /**
     * Get the transport trips using this diesel price record.
     */
    public function transports(): HasMany
    {
        return $this->hasMany(Transport::class, 'desial_price_id', 'id');
    }
}
