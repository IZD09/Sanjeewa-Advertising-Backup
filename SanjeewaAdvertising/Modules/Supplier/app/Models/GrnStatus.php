<?php

namespace Modules\Supplier\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GrnStatus extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'grn_statuses';

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
        'grn_status',
    ];

    /**
     * Status ID constants.
     */
    public const STATUS_DRAFT = 1;

    public const STATUS_APPROVED = 2;

    public const STATUS_COMPLETED = 3;

    public const STATUS_CANCELLED = 4;

    public const STATUS_PENDING = 5;

    public const STATUS_PENDING_STOCK = 6;

    /**
     * Resolve a grn_statuses_id from a status name or numeric ID.
     */
    public static function resolveIdByName(string|int|null $status, int $default = self::STATUS_PENDING): int
    {
        if (is_int($status) || (is_string($status) && ctype_digit($status))) {
            $id = (int) $status;

            return $id > 0 ? $id : $default;
        }

        $normalized = strtolower(trim((string) $status));
        if ($normalized === '') {
            return $default;
        }

        $mapped = match ($normalized) {
            'draft' => self::STATUS_DRAFT,
            'approved' => self::STATUS_APPROVED,
            'completed' => self::STATUS_COMPLETED,
            'cancelled', 'canceled' => self::STATUS_CANCELLED,
            'pending' => self::STATUS_PENDING,
            'pending stock', 'pending_stock' => self::STATUS_PENDING_STOCK,
            default => null,
        };

        if ($mapped !== null) {
            return $mapped;
        }

        $foundId = static::query()
            ->whereRaw('LOWER(grn_status) = ?', [$normalized])
            ->value('id');

        return $foundId ? (int) $foundId : $default;
    }

    /**
     * Get the GRN records associated with this status.
     */
    public function grns(): HasMany
    {
        return $this->hasMany(Grn::class, 'grn_statuses_id', 'id');
    }
}
