<?php

namespace Modules\Transaction\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Supplier\Models\Grn;

class GrnPayment extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'grn_payments';

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
        'payment_types_id',
        'pay_date',
        'grn_id',
        'payment_statuses_id',
        'payment',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payment_types_id' => 'integer',
            'pay_date' => 'datetime',
            'grn_id' => 'integer',
            'payment_statuses_id' => 'integer',
            'payment' => 'decimal:2',
        ];
    }

    /**
     * Get the payment type used for this GRN payment.
     */
    public function paymentType(): BelongsTo
    {
        return $this->belongsTo(PaymentType::class, 'payment_types_id', 'id');
    }

    /**
     * Get the GRN associated with this payment.
     */
    public function grn(): BelongsTo
    {
        return $this->belongsTo(Grn::class, 'grn_id', 'id');
    }

    /**
     * Get the status of this GRN payment.
     */
    public function paymentStatus(): BelongsTo
    {
        return $this->belongsTo(PaymentStatus::class, 'payment_statuses_id', 'id');
    }
}
