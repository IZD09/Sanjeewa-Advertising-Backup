<?php

namespace Modules\Transaction\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\PrintJob\Models\PrintJob;

class Payment extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'payments';

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
        'payment',
        'print_jobs_id',
        'payment_types_id',
        'pay_date',
        'payment_statuses_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payment' => 'decimal:2',
            'print_jobs_id' => 'integer',
            'payment_types_id' => 'integer',
            'pay_date' => 'datetime',
            'payment_statuses_id' => 'integer',
        ];
    }

    /**
     * Get the print job associated with this payment.
     */
    public function printJob(): BelongsTo
    {
        return $this->belongsTo(PrintJob::class, 'print_jobs_id', 'id');
    }

    /**
     * Get the payment type used for this payment.
     */
    public function paymentType(): BelongsTo
    {
        return $this->belongsTo(PaymentType::class, 'payment_types_id', 'id');
    }

    /**
     * Get the payment status for this payment.
     */
    public function paymentStatus(): BelongsTo
    {
        return $this->belongsTo(PaymentStatus::class, 'payment_statuses_id', 'id');
    }
}
