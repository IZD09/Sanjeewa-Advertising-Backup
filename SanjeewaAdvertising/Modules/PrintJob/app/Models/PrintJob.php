<?php

namespace Modules\PrintJob\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Modules\Customer\Models\Customer;
use Modules\Design\Models\PrintType;
use Modules\Inventory\Models\Stock;
use Modules\Invoice\Models\Invoice;
use Modules\Transaction\Models\Payment;
use Modules\User\Models\User;

class PrintJob extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'print_jobs';

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
        'users_id',
        'customer_id',
        'print_types_id',
        'add_date',
        'qty',
        'wtdth',
        'hight',
        'unit_id',
        'delivery_method_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'users_id' => 'integer',
            'customer_id' => 'integer',
            'print_types_id' => 'integer',
            'add_date' => 'datetime',
            'qty' => 'integer',
            'wtdth' => 'integer',
            'hight' => 'integer',
            'unit_id' => 'integer',
            'delivery_method_id' => 'integer',
        ];
    }

    /**
     * Get the unit of measurement for this job's dimensions.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'id');
    }

    /**
     * Get the delivery method for this print job.
     */
    public function deliveryMethod(): BelongsTo
    {
        return $this->belongsTo(DeliveryMethod::class, 'delivery_method_id', 'id');
    }

    /**
     * Get the user who registered this print job.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'users_id', 'id');
    }

    /**
     * Get the customer who placed this print job.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    /**
     * Get the print type required for this job.
     */
    public function printType(): BelongsTo
    {
        return $this->belongsTo(PrintType::class, 'print_types_id', 'id');
    }

    /**
     * Get the status update history for this print job.
     */
    public function statusHistory(): HasMany
    {
        return $this->hasMany(PrintJobStatusHistory::class, 'print_jobs_id', 'id');
    }

    /**
     * Get the latest status history entry for this print job.
     */
    public function latestStatusHistory(): HasOne
    {
        return $this->hasOne(PrintJobStatusHistory::class, 'print_jobs_id', 'id')->latestOfMany('update_at');
    }

    /**
     * Get the stock item records for this print job.
     */
    public function jobStockItems(): HasMany
    {
        return $this->hasMany(PrintJobStockItem::class, 'print_jobs_id', 'id');
    }

    /**
     * Get the stock items allocated to this print job.
     */
    public function stockItems(): BelongsToMany
    {
        return $this->belongsToMany(
            Stock::class,
            'print_jobs_stock_items',
            'print_jobs_id',
            'stock_id'
        )->withPivot('qty');
    }

    /**
     * Get the cost breakdown for this print job.
     */
    public function cost(): HasOne
    {
        return $this->hasOne(PrintJobCost::class, 'print_jobs_id', 'id');
    }

    /**
     * Get the invoices associated with this print job.
     */
    public function invoices(): BelongsToMany
    {
        return $this->belongsToMany(
            Invoice::class,
            'invoice_print_jobs',
            'print_jobs_id',
            'invoice_id'
        );
    }

    /**
     * Get payments made directly against this print job.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'print_jobs_id', 'id');
    }
}
