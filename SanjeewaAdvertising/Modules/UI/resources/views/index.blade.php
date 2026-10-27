<x-ui::layouts.master>
    {{-- Module 1: Dashboard --}}
    @include('ui::layouts.dashboard.dashboard')

    {{-- Module 2: Place Order --}}
    @include('ui::layouts.place-order.place-order')

    {{-- Module 3: Customers Directory --}}
    @include('ui::layouts.customers.customers')

    {{-- Module 4: Print Jobs / Production Queue --}}
    @include('ui::layouts.print-jobs.print-jobs')

    {{-- Module 5: Reports & Financial Performance --}}
    @include('ui::layouts.reports.reports')

    {{-- Module 6: Settings & Shop Preferences --}}
    @include('ui::layouts.settings.settings')

    {{-- Module 7: Inventory & Stock Management --}}
    @include('ui::layouts.inventory.inventory')

    {{-- Module 8: Goods Received Note (GRN) --}}
    @include('ui::layouts.grn.grn')

    {{-- Module 9: Payments Management Hub --}}
    @include('ui::layouts.payments.payments')
</x-ui::layouts.master>
