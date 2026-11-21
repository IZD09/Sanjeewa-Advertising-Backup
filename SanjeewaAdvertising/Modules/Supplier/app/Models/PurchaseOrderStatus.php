<?php

namespace Modules\Supplier\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrderStatus extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'purchase_orders_status';

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
        'purchase_orders_status',
    ];

    /**
     * Status ID constants.
     */
    public const STATUS_PENDING = 1;

    public const STATUS_PARTIAL = 2;

    public const STATUS_COMPLETED = 3;

    public const STATUS_CANCELLED = 4;

    public const STATUS_APPROVED = 5;

    /**
     * Resolve status ID by name or integer.
     */
    public static function getIdForStatus(string|int $status): ?int
    {
        if (is_numeric($status)) {
            return (int) $status;
        }

        $normalized = strtolower(trim((string) $status));
        $record = static::whereRaw('LOWER(purchase_orders_status) = ?', [$normalized])->first();
        if ($record) {
            return (int) $record->id;
        }

        return match ($normalized) {
            'pending' => self::STATUS_PENDING,
            'approved' => self::STATUS_APPROVED,
            'partial' => self::STATUS_PARTIAL,
            'completed' => self::STATUS_COMPLETED,
            'cancelled', 'canceled' => self::STATUS_CANCELLED,
            default => null,
        };
    }

    /**
     * Get the purchase orders associated with this status.
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class, 'purchase_orders_status_id', 'id');
    }
}
