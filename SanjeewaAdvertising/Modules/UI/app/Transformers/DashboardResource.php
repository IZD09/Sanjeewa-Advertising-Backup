<?php

namespace Modules\UI\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    /**
     * Disable wrapping for this resource to match the requested schema exactly.
     *
     * @var string|null
     */
    public static $wrap = null;

    /**
     * Transform the resource into an array matching the frontend slides schema.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) ? $this->resource : [];

        return [
            'overview' => $data['overview'] ?? [],
            'revenue' => $data['revenue'] ?? [],
            'jobs' => $data['jobs'] ?? [],
            'stock' => $data['stock'] ?? [],
            'finance' => $data['finance'] ?? [],
        ];
    }
}
