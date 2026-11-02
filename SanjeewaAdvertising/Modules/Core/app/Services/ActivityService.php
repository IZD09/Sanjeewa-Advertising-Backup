<?php

namespace Modules\Core\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Admin\Models\AdminActivity;
use Modules\Core\Models\Activity;
use Modules\Core\Models\ActivityType;
use Modules\Core\Models\UserActivity;

class ActivityService
{
    /**
     * Build the query for activities with relations and filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Activity>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = Activity::query()->with(['activityType', 'userActivity', 'adminActivity']);

        if (! empty($filters['activity_types_id'])) {
            $query->where('activity_types_id', (int) $filters['activity_types_id']);
        }

        if (! empty($filters['user_or_admin'])) {
            $query->where('user_or_admin', (int) $filters['user_or_admin']);
        }

        if (! empty($filters['from_date'])) {
            $query->whereDate('activity_time', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('activity_time', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('activity_time')->orderByDesc('id');
    }

    /**
     * Retrieve all activities.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Activity>
     */
    public function getAllActivities(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated activities.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getActivities(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find an activity by ID.
     */
    public function getActivityById(int $id): ?Activity
    {
        return Activity::query()->with(['activityType', 'userActivity', 'adminActivity'])->find($id);
    }

    /**
     * Record an audit activity log entry.
     *
     * @param  array<string, mixed>  $data
     */
    public function logActivity(array $data): Activity
    {
        return DB::transaction(function () use ($data) {
            $payload = is_string($data['activity'])
                ? ['message' => $data['activity']]
                : (array) $data['activity'];

            $userOrAdmin = ! empty($data['user_or_admin'])
                ? (int) $data['user_or_admin']
                : (! empty($data['admins_id']) ? 2 : 1);

            $activity = Activity::create([
                'activity_time' => ! empty($data['activity_time']) ? $data['activity_time'] : now(),
                'user_or_admin' => $userOrAdmin,
                'activity' => $payload,
                'activity_types_id' => (int) $data['activity_types_id'],
            ]);

            if (! empty($data['admins_id'])) {
                AdminActivity::create([
                    'activities_id' => $activity->id,
                    'admins_id' => (int) $data['admins_id'],
                ]);
            } elseif (! empty($data['users_id'])) {
                UserActivity::create([
                    'activities_id' => $activity->id,
                    'users_id' => (int) $data['users_id'],
                ]);
            }

            return $activity->load(['activityType', 'userActivity', 'adminActivity']);
        });
    }

    /**
     * Retrieve all activity types.
     *
     * @return Collection<int, ActivityType>
     */
    public function getAllActivityTypes(): Collection
    {
        return ActivityType::query()->orderBy('id')->get();
    }
}
