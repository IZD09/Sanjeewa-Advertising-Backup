<!-- ==========================================================================
     ADMIN SHARED MODALS CONTAINER
     Organized into Admin Page Modules
     ========================================================================== -->

{{-- Admin Profile Modals --}}
@include('ui::layouts.admin.modals.profile.profile-lock-modal')
@include('ui::layouts.admin.modals.profile.activities-verify-modal')

{{-- Admin User Control Modals --}}
@include('ui::layouts.admin.modals.user-control.add-user-modal')
@include('ui::layouts.admin.modals.user-control.add-admin-modal')
@include('ui::layouts.admin.modals.user-control.view-user-profile-modal')
@include('ui::layouts.admin.modals.user-control.security-lock-modal')

{{-- Admin HR Management Modals --}}
@include('ui::layouts.admin.modals.hr-management.add-staff-modal')
@include('ui::layouts.admin.modals.hr-management.set-salary-modal')
@include('ui::layouts.admin.modals.hr-management.pay-daily-salary-modal')
@include('ui::layouts.admin.modals.hr-management.view-staff-modal')
@include('ui::layouts.admin.modals.hr-management.change-staff-status-modal')
