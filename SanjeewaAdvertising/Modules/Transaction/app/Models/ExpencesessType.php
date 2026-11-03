<?php

namespace Modules\Transaction\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpencesessType extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'expencesess_types';

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
        'expencesess_type',
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
        ];
    }

    /**
     * Get the expenses associated with this expense type.
     */
    public function expencesess(): HasMany
    {
        return $this->hasMany(Expencesess::class, 'expencesess_types_id', 'id');
    }

    /**
     * Alias for expencesess relation.
     */
    public function expenses(): HasMany
    {
        return $this->expencesess();
    }
}
