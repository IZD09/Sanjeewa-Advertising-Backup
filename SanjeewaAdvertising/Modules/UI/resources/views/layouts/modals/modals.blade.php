<!-- ==========================================================================
     SHARED MODALS CONTAINER
     Organized into Page Modules
     ========================================================================== -->

{{-- Place Order Modals --}}
@include('ui::layouts.modals.place-order.create-order-modal')
@include('ui::layouts.modals.place-order.order-confirmation-modal')
@include('ui::layouts.modals.place-order.view-order-modal')
@include('ui::layouts.modals.place-order.edit-order-modal')
@include('ui::layouts.modals.place-order.add-payment-modal')
@include('ui::layouts.modals.place-order.payment-history-modal')
@include('ui::layouts.modals.place-order.receipt-modal')

{{-- Customer Modals --}}
@include('ui::layouts.modals.customers.add-customer-modal')

{{-- Payments Hub Modals --}}
@include('ui::layouts.modals.payments.record-invoice-payment-modal')
@include('ui::layouts.modals.payments.record-grn-payment-modal')
@include('ui::layouts.modals.payments.record-bill-payment-modal')
@include('ui::layouts.modals.payments.record-payment-modal')
@include('ui::layouts.modals.payments.printable-receipt-modal')
@include('ui::layouts.modals.payments.add-expense-bill-modal')
@include('ui::layouts.modals.payments.mark-expense-paid-modal')

