<?php

namespace Modules\Core\Support;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;

class MobileNumberHelper
{
    /**
     * Generate normalized mobile number search variants for Sri Lankan formats
     * (e.g. "+94779646903", "0779646903", "94779646903", "779646903").
     *
     * @return list<string>
     */
    public static function searchVariants(string $search): array
    {
        $trimmed = trim($search);
        if ($trimmed === '') {
            return [];
        }

        $variants = [$trimmed];
        $compact = preg_replace('/[\s\-()]+/', '', $trimmed) ?? $trimmed;

        if ($compact === '' || ! preg_match('/^\+?\d+$/', $compact)) {
            return $variants;
        }

        $variants[] = $compact;

        if (str_starts_with($compact, '+94')) {
            $localCore = ltrim(substr($compact, 3), '0');
            if ($localCore !== '') {
                $variants[] = '0'.$localCore;
                $variants[] = '94'.$localCore;
                if (strlen($localCore) >= 7) {
                    $variants[] = $localCore;
                }
            }
        } elseif (str_starts_with($compact, '94') && strlen($compact) >= 3) {
            $localCore = ltrim(substr($compact, 2), '0');
            $variants[] = '+'.$compact;
            if ($localCore !== '') {
                $variants[] = '0'.$localCore;
                if (strlen($localCore) >= 7) {
                    $variants[] = $localCore;
                }
            }
        } elseif (str_starts_with($compact, '0') && strlen($compact) >= 2) {
            $localCore = ltrim(substr($compact, 1), '0');
            if ($localCore !== '') {
                $variants[] = '+94'.$localCore;
                $variants[] = '94'.$localCore;
                if (strlen($localCore) >= 7) {
                    $variants[] = $localCore;
                }
            }
        } elseif (strlen($compact) === 9 && ! str_starts_with($compact, '0')) {
            $variants[] = '0'.$compact;
            $variants[] = '+94'.$compact;
            $variants[] = '94'.$compact;
        }

        return array_values(array_unique($variants));
    }

    /**
     * Apply an OR LIKE clause across all normalized mobile search variants.
     */
    public static function orWhereMobileLike(EloquentBuilder|QueryBuilder $query, string $column, string $search): void
    {
        foreach (self::searchVariants($search) as $variant) {
            $query->orWhere($column, 'like', "%{$variant}%");
        }
    }
}
