<?php

namespace Modules\Transaction\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\User\Models\User;

class Expencesess extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'expencesess';

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
        'expencesess_types_id',
        'price',
        'expencesess_statuses_id',
        'add_by',
        'pay_by',
        'add_date',
        'pay_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'expencesess_types_id' => 'integer',
            'price' => 'decimal:2',
            'expencesess_statuses_id' => 'integer',
            'add_by' => 'integer',
            'pay_by' => 'integer',
            'add_date' => 'datetime',
            'pay_at' => 'datetime',
        ];
    }

    /**
     * Get the expense type associated with this expense.
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(ExpencesessType::class, 'expencesess_types_id', 'id');
    }

    /**
     * Get the expense status associated with this expense.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(ExpencesessStatus::class, 'expencesess_statuses_id', 'id');
    }

    /**
     * Get the user who added this expense.
     */
    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'add_by', 'id');
    }

    /**
     * Get the user who paid this expense.
     */
    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pay_by', 'id');
    }
}
