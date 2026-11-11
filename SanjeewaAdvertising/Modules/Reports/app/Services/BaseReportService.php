<?php

namespace Modules\Reports\Services;

use Carbon\Carbon;
use Modules\Reports\Transactions\FetchReportDataTransaction;

abstract class BaseReportService
{
    public function __construct(
        public FetchReportDataTransaction $transaction
    ) {}

    /**
     * Resolve date range (start, end) from filter array.
     *
     * @param  array<string, mixed>  $filters
     * @return array{0: Carbon, 1: Carbon}
     */
    public function resolveDateRange(array $filters): array
    {
        return $this->transaction->resolveDateRange($filters);
    }

    /**
     * Fetch aggregated financial metrics across database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, float|int>
     */
    public function fetchAggregatedFinancials(array $filters): array
    {
        return $this->transaction->fetchAggregatedFinancials($filters);
    }
}
