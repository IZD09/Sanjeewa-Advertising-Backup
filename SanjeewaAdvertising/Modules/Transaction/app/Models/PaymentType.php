<?php

namespace Modules\Transaction\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentType extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'payment_types';

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
        'payment_type',
    ];

    /**
     * Get the customer print job payments of this type.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'payment_types_id', 'id');
    }

    /**
     * Get the GRN payments of this type.
     */
    public function grnPayments(): HasMany
    {
        return $this->hasMany(GrnPayment::class, 'payment_types_id', 'id');
    }
}
