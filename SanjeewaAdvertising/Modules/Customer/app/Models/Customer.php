<?php

namespace Modules\Customer\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Modules\Invoice\Models\Invoice;
use Modules\PrintJob\Models\PrintJob;
use Modules\Transaction\Models\Payment;

class Customer extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'customer';

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
        'name',
        'mobile',
        'email',
        'register_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'register_at' => 'datetime',
        ];
    }

    /**
     * Get the print jobs for the customer.
     */
    public function printJobs(): HasMany
    {
        return $this->hasMany(PrintJob::class, 'customer_id', 'id');
    }

    /**
     * Get the invoices for the customer.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'customer_id', 'id');
    }

    /**
     * Get payments made by this customer through their print jobs.
     */
    public function payments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Payment::class,
            PrintJob::class,
            'customer_id',
            'print_jobs_id',
            'id',
            'id'
        );
    }

    /**
     * Determine customer membership badge based on orders count.
     */
    public function getBadgeAttribute(): string
    {
        $ordersCount = $this->print_jobs_count ?? $this->printJobs()->count();
        if ($ordersCount >= 10) {
            return 'VIP';
        }
        if ($ordersCount >= 5) {
            return 'Corporate';
        }

        return 'Regular';
    }
}
