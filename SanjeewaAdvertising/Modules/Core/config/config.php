<?php

return [
    'name' => 'Core',

    'request_priority' => [
        'high_concurrency_threshold' => (int) env('REQUEST_PRIORITY_HIGH_THRESHOLD', 5),
        'retry_after_seconds' => (int) env('REQUEST_PRIORITY_RETRY_AFTER', 2),
        'rate_limits' => [
            'high' => (int) env('REQUEST_PRIORITY_LIMIT_HIGH', 180),
            'normal' => (int) env('REQUEST_PRIORITY_LIMIT_NORMAL', 120),
            'low' => (int) env('REQUEST_PRIORITY_LIMIT_LOW', 60),
        ],
    ],
];
