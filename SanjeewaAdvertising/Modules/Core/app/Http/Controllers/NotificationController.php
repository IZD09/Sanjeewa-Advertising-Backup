<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Models\ActivityType;
use Modules\Core\Services\ActivityService;
use Modules\Core\Services\NotificationService;
use Modules\User\Models\User;

class NotificationController extends BaseApiController
{
    public function __construct(
        protected NotificationService $notificationService,
        protected ActivityService $activityService
    ) {
    }

    /**
     * Retrieve the list of notifications and unread count for current user or admin.
     */
    public function index(Request $request): JsonResponse
    {
        $actor = Auth::guard('admin')->user() ?? Auth::guard('web')->user();

        if (! $actor) {
            return $this->unauthorized('Unauthenticated.');
        }

        $unreadOnly = $request->boolean('unread_only');
        $limit = min(50, max(1, (int) $request->input('limit', 15)));

        $notifications = $this->notificationService->getNotifications($actor, $limit, $unreadOnly);
        $unreadCount = $this->notificationService->getUnreadCount($actor);

        return $this->success([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ], 'Notifications retrieved successfully.');
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $actor = Auth::guard('admin')->user() ?? Auth::guard('web')->user();

        if (! $actor) {
            return $this->unauthorized('Unauthenticated.');
        }

        $success = $this->notificationService->markAsRead($id, $actor);

        return $this->success([
            'marked' => $success,
            'unread_count' => $this->notificationService->getUnreadCount($actor),
        ], 'Notification marked as read.');
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $actor = Auth::guard('admin')->user() ?? Auth::guard('web')->user();

        if (! $actor) {
            return $this->unauthorized('Unauthenticated.');
        }

        $this->notificationService->markAllAsRead($actor);

        return $this->success([
            'unread_count' => 0,
        ], 'All notifications marked as read.');
    }

    /**
     * Handle one-click permission request submitted by a user without module privileges.
     */
    public function requestPermissions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        /** @var User $user */
        $user = User::query()->findOrFail((int) $validated['user_id']);
        $fullName = trim("{$user->first_name} {$user->last_name}") ?: $user->username;

        // 1. Send in-app notification to all active Administrators
        $adminTargetUrl = route('admin.user-control');
        $this->notificationService->notifyAdmins(
            title: 'Module Access Request',
            message: "Staff member '{$fullName}' (@{$user->username}) has requested system module permissions.",
            actionUrl: $adminTargetUrl,
            type: 'access_request',
            icon: 'fa-solid fa-key',
            metadata: [
                'user_id' => $user->id,
                'username' => $user->username,
                'name' => $fullName,
                'mobile' => $user->mobile,
            ]
        );

        // 2. Record in system Activity Log
        try {
            $activityType = ActivityType::firstOrCreate(['activity_type' => 'Permission Request']);
            $this->activityService->logActivity([
                'activity_time' => now(),
                'user_or_admin' => 1,
                'activity_types_id' => $activityType->id,
                'users_id' => $user->id,
                'activity' => [
                    'action' => 'user_request_permissions',
                    'user_id' => $user->id,
                    'username' => $user->username,
                    'name' => $fullName,
                    'message' => "User '{$fullName}' (@{$user->username}) requested module access permissions from Administrator.",
                ],
            ]);
        } catch (\Throwable $e) {
            report($e);
        }

        return $this->success([
            'requested' => true,
            'user_id' => $user->id,
        ], 'Permission request sent to administrators successfully.');
    }
}
