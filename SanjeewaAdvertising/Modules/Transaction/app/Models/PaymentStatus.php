<?php

namespace Modules\Transaction\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentStatus extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'payment_statuses';

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
        'payment_status',
    ];

    /**
     * Get the customer print job payments with this status.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'payment_statuses_id', 'id');
    }

    /**
     * Get the GRN payments with this status.
     */
    public function grnPayments(): HasMany
    {
        return $this->hasMany(GrnPayment::class, 'payment_statuses_id', 'id');
    }
}
