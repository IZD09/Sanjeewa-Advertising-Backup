<?php

namespace Modules\Design\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\PrintJob\Models\PrintJob;

class PrintType extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'print_types';

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
        'print_type',
    ];

    /**
     * Get the print cost types for the print type.
     */
    public function printCostTypes(): HasMany
    {
        return $this->hasMany(PrintCostType::class, 'print_types_id', 'id');
    }

    /**
     * Get the print jobs for the print type.
     */
    public function printJobs(): HasMany
    {
        return $this->hasMany(PrintJob::class, 'print_types_id', 'id');
    }
}
