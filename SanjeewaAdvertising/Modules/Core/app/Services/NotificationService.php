<?php

namespace Modules\Core\Services;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;
use Modules\Admin\Models\Admin;
use Modules\Core\Notifications\SystemNotification;
use Modules\User\Models\User;

class NotificationService
{
    /**
     * Send a notification to all active system administrators.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function notifyAdmins(
        string $title,
        string $message,
        ?string $actionUrl = null,
        string $type = 'info',
        string $icon = 'fa-solid fa-bell',
        array $metadata = []
    ): void {
        try {
            $admins = Admin::query()->where('admin_statuses_id', 1)->get();
            if ($admins->isNotEmpty()) {
                Notification::send($admins, new SystemNotification(
                    title: $title,
                    message: $message,
                    actionUrl: $actionUrl,
                    type: $type,
                    icon: $icon,
                    metadata: $metadata
                ));
            }
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Send a notification to a specific staff user.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function notifyUser(
        User|int $user,
        string $title,
        string $message,
        ?string $actionUrl = null,
        string $type = 'info',
        string $icon = 'fa-solid fa-bell',
        array $metadata = []
    ): void {
        try {
            $targetUser = is_int($user) ? User::find($user) : $user;
            if ($targetUser) {
                $targetUser->notify(new SystemNotification(
                    title: $title,
                    message: $message,
                    actionUrl: $actionUrl,
                    type: $type,
                    icon: $icon,
                    metadata: $metadata
                ));
            }
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Send a notification to a specific administrator.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function notifyAdmin(
        Admin|int $admin,
        string $title,
        string $message,
        ?string $actionUrl = null,
        string $type = 'info',
        string $icon = 'fa-solid fa-bell',
        array $metadata = []
    ): void {
        try {
            $targetAdmin = is_int($admin) ? Admin::find($admin) : $admin;
            if ($targetAdmin) {
                $targetAdmin->notify(new SystemNotification(
                    title: $title,
                    message: $message,
                    actionUrl: $actionUrl,
                    type: $type,
                    icon: $icon,
                    metadata: $metadata
                ));
            }
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Retrieve formatted notifications for a given authenticatable entity.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function getNotifications(Authenticatable $notifiable, int $limit = 15, bool $unreadOnly = false): Collection
    {
        if (! method_exists($notifiable, 'notifications')) {
            return collect();
        }

        $query = $notifiable->notifications();
        if ($unreadOnly) {
            $query->whereNull('read_at');
        }

        return $query->take($limit)->get()->map(function ($n): array {
            $data = is_array($n->data) ? $n->data : [];

            return [
                'id' => $n->id,
                'title' => (string) ($data['title'] ?? 'Notification'),
                'message' => (string) ($data['message'] ?? ''),
                'action_url' => $data['action_url'] ?? null,
                'type' => (string) ($data['type'] ?? 'info'),
                'icon' => (string) ($data['icon'] ?? 'fa-solid fa-bell'),
                'metadata' => (array) ($data['metadata'] ?? []),
                'read' => ! is_null($n->read_at),
                'read_at' => $n->read_at ? $n->read_at->format('Y-m-d H:i:s') : null,
                'created_at' => $n->created_at ? $n->created_at->format('Y-m-d H:i:s') : null,
                'time_ago' => $n->created_at ? $n->created_at->diffForHumans() : 'just now',
            ];
        });
    }

    /**
     * Get the count of unread notifications for a given entity.
     */
    public function getUnreadCount(Authenticatable $notifiable): int
    {
        if (! method_exists($notifiable, 'unreadNotifications')) {
            return 0;
        }

        return (int) $notifiable->unreadNotifications()->count();
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(string $notificationId, Authenticatable $notifiable): bool
    {
        if (! method_exists($notifiable, 'unreadNotifications')) {
            return false;
        }

        $notification = $notifiable->unreadNotifications()->where('id', $notificationId)->first();
        if ($notification) {
            $notification->markAsRead();

            return true;
        }

        return false;
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Authenticatable $notifiable): bool
    {
        if (! method_exists($notifiable, 'unreadNotifications')) {
            return false;
        }

        $notifiable->unreadNotifications()->update(['read_at' => now()]);

        return true;
    }
}
