<?php

namespace Modules\Transport\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Admin\Models\Admin;
use Modules\Core\Services\LiveSyncService;
use Modules\HR\Models\Staff;
use Modules\HR\Models\StaffStatus;
use Modules\PrintJob\Models\PrintJob;
use Modules\Transport\Models\DesialPrice;
use Modules\Transport\Models\StaffType;
use Modules\Transport\Models\Transport;
use Modules\Transport\Models\Truck;
use Modules\Transport\Models\VehicleModel;

class TransportService
{
    /**
     * Gather comprehensive Transport & Fleet data for the Admin Transport page and JSON API.
     *
     * @return array<string, mixed>
     */
    public function getTransportDashboardData(): array
    {
        $dieselPrices = DesialPrice::query()
            ->withCount('transports')
            ->orderByDesc('add_date')
            ->orderByDesc('id')
            ->get();

        $latestDiesel = $dieselPrices->first();
        $currentDieselRate = $latestDiesel ? (float) $latestDiesel->price : 286.00;

        $transports = Transport::query()
            ->with([
                'truck.vehicleModel',
                'staff.staffType',
                'staff.status',
                'desialPrice',
                'printJob.customer',
                'printJob.printType',
            ])
            ->orderByRaw('CASE WHEN end IS NULL THEN 0 ELSE 1 END ASC')
            ->orderByDesc('start')
            ->orderByDesc('id')
            ->get();

        $activeTripByTruck = [];
        $activeTripByStaff = [];
        foreach ($transports as $trip) {
            if ($trip->end === null) {
                $activeTripByTruck[(int) $trip->truck_id] = $trip;
                $activeTripByStaff[(int) $trip->staff_id] = $trip;
            }
        }

        $trucks = Truck::query()
            ->with([
                'vehicleModel',
                'defaultDriver.staffType',
                'defaultDriver.status',
                'transports',
            ])
            ->orderBy('id')
            ->get();

        $models = VehicleModel::query()
            ->withCount('trucks')
            ->orderBy('mane')
            ->get()
            ->map(fn (VehicleModel $m): array => [
                'id' => (int) $m->id,
                'name' => $m->mane,
                'mane' => $m->mane,
                'trucks_count' => (int) $m->trucks_count,
            ])
            ->values()
            ->all();

        $allStaffModels = Staff::query()
            ->with(['staffType', 'status'])
            ->withCount('transports')
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();

        $assignedDriverIds = $trucks->pluck('default_staff_id')->filter()->map(fn ($id): int => (int) $id)->all();

        $formattedStaff = $allStaffModels->map(function (Staff $member) use ($activeTripByStaff, $trucks, $transports): array {
            $fullName = trim($member->first_name.' '.$member->last_name);
            $typeName = $member->staffType?->staff_type ?? 'General Staff';
            $statusName = $member->status?->staff_status ?? 'Active';
            $activeTrip = $activeTripByStaff[(int) $member->id] ?? null;

            $assignedTrucks = $trucks
                ->filter(fn (Truck $t): bool => (int) $t->default_staff_id === (int) $member->id)
                ->map(fn (Truck $t): string => $t->register)
                ->values()
                ->all();

            $driverTrips = $transports->where('staff_id', $member->id);
            $totalKm = (int) $driverTrips->sum('junry');
            $totalDiesel = round((float) $driverTrips->sum('diesel_liters'), 3);

            return [
                'id' => (int) $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'full_name' => $fullName,
                'mobile' => $member->mobile,
                'nic' => $member->nic,
                'staff_type_id' => (int) $member->staff_type_id,
                'staff_type' => $typeName,
                'status' => $statusName,
                'is_active' => strtolower($statusName) === 'active',
                'is_driver_role' => in_array(strtolower($typeName), ['driver', 'delivery assistant'], true),
                'is_on_trip' => $activeTrip !== null,
                'active_trip_truck' => $activeTrip?->truck?->register,
                'assigned_vehicles' => $assignedTrucks,
                'transports_count' => (int) $member->transports_count,
                'total_km' => $totalKm,
                'total_diesel_liters' => $totalDiesel,
            ];
        })->values();

        $drivers = $formattedStaff->filter(function (array $s) use ($assignedDriverIds): bool {
            return $s['is_driver_role']
                || $s['transports_count'] > 0
                || in_array($s['id'], $assignedDriverIds, true);
        })->values()->all();

        $formattedVehicles = $trucks->map(fn (Truck $truck): array => $this->formatTruck($truck, $activeTripByTruck[(int) $truck->id] ?? null))->values()->all();

        $formattedDispatches = $transports->map(fn (Transport $trip): array => $this->formatTransport($trip, $currentDieselRate))->values()->all();

        $formattedDieselPrices = $dieselPrices->map(fn (DesialPrice $dp): array => [
            'id' => (int) $dp->id,
            'price' => round((float) $dp->price, 2),
            'add_date' => $dp->add_date ? Carbon::parse($dp->add_date)->toDateString() : '',
            'date_formatted' => $dp->add_date ? Carbon::parse($dp->add_date)->format('M d, Y') : '—',
            'transports_count' => (int) $dp->transports_count,
        ])->values()->all();

        $deliverableJobs = PrintJob::query()
            ->with(['customer', 'printType'])
            ->orderByDesc('id')
            ->limit(40)
            ->get()
            ->map(fn (PrintJob $job): array => [
                'id' => (int) $job->id,
                'job_code' => 'JOB-'.str_pad((string) $job->id, 4, '0', STR_PAD_LEFT),
                'customer_name' => $job->customer?->name ?? 'Walk-in Customer',
                'print_type' => $job->printType?->print_type ?? 'Print Order',
                'qty' => (int) $job->qty,
                'label' => 'JOB-'.str_pad((string) $job->id, 4, '0', STR_PAD_LEFT).' • '.($job->customer?->name ?? 'Customer').' ('.($job->printType?->print_type ?? 'Order').')',
            ])
            ->values()
            ->all();

        $todayStr = today()->toDateString();
        $inTransitCount = $transports->filter(fn (Transport $t): bool => $t->end === null)->count();
        $deliveredTodayCount = $transports->filter(
            fn (Transport $t): bool => $t->end !== null && Carbon::parse($t->end)->toDateString() === $todayStr
        )->count();

        $maintenanceVehiclesCount = collect($formattedVehicles)->where('status', 'Maintenance')->count();
        $activeVehiclesCount = max(0, count($formattedVehicles) - $maintenanceVehiclesCount);
        $availableVehiclesCount = collect($formattedVehicles)->where('status', 'Available')->count();

        $totalDistanceKm = (int) $transports->sum('junry');
        $totalDieselLiters = round((float) $transports->sum(fn (Transport $t): float => (float) ($t->diesel_liters ?? 0)), 3);
        $totalDieselCost = round((float) $transports->sum(function (Transport $t) use ($currentDieselRate): float {
            if ($t->diesel_cost !== null) {
                return (float) $t->diesel_cost;
            }
            if ($t->diesel_liters !== null) {
                $rate = (float) ($t->desialPrice?->price ?? $currentDieselRate);

                return round((float) $t->diesel_liters * $rate, 2);
            }

            return 0.0;
        }), 2);

        $todayCompleted = $transports->filter(
            fn (Transport $t): bool => $t->end !== null && Carbon::parse($t->end)->toDateString() === $todayStr
        );
        $todayDieselLiters = round((float) $todayCompleted->sum(fn (Transport $t): float => (float) ($t->diesel_liters ?? 0)), 3);
        $todayDieselCost = round((float) $todayCompleted->sum(fn (Transport $t): float => (float) ($t->diesel_cost ?? 0)), 2);

        return [
            'kpi' => [
                'total_dispatches' => $transports->count(),
                'in_transit' => $inTransitCount,
                'delivered_today' => $deliveredTodayCount,
                'active_vehicles' => $activeVehiclesCount,
                'available_vehicles' => $availableVehiclesCount,
                'maintenance_vehicles' => $maintenanceVehiclesCount,
                'total_vehicles' => count($formattedVehicles),
                'total_distance_km' => $totalDistanceKm,
                'total_diesel_liters' => $totalDieselLiters,
                'total_diesel_cost' => $totalDieselCost,
                'today_diesel_liters' => $todayDieselLiters,
                'today_diesel_cost' => $todayDieselCost,
                'current_diesel_rate' => round($currentDieselRate, 2),
                'current_diesel_id' => $latestDiesel?->id ? (int) $latestDiesel->id : null,
                'drivers_count' => count($drivers),
            ],
            'dispatches' => $formattedDispatches,
            'vehicles' => $formattedVehicles,
            'models' => $models,
            'drivers' => $drivers,
            'all_staff' => $formattedStaff->all(),
            'diesel_prices' => $formattedDieselPrices,
            'deliverable_jobs' => $deliverableJobs,
        ];
    }

    /**
     * Format a Truck model into an enriched UI array.
     *
     * @return array<string, mixed>
     */
    public function formatTruck(Truck $truck, ?Transport $activeTrip = null): array
    {
        if ($activeTrip === null && $truck->relationLoaded('transports')) {
            $activeTrip = $truck->transports->first(fn (Transport $t): bool => $t->end === null);
        }

        $rawStatus = trim((string) ($truck->status ?: 'Available'));
        $effectiveStatus = $activeTrip !== null
            ? 'On Trip'
            : ($rawStatus === 'On Trip' ? 'Available' : $rawStatus);

        $trips = $truck->relationLoaded('transports') ? $truck->transports : collect();
        $maxEndKm = (int) $trips->max(fn (Transport $t): int => max((int) $t->start_km, (int) ($t->end_km ?? 0)));
        $currentKm = max((int) ($truck->current_km ?? 0), $maxEndKm);

        $completedTrips = $trips->filter(fn (Transport $t): bool => $t->end !== null);
        $totalKm = (int) $completedTrips->sum('junry');
        $totalDieselLiters = round((float) $completedTrips->sum(fn (Transport $t): float => (float) ($t->diesel_liters ?? 0)), 3);
        $totalDieselCost = round((float) $completedTrips->sum(fn (Transport $t): float => (float) ($t->diesel_cost ?? 0)), 2);

        $measuredEfficiency = ($totalDieselLiters > 0 && $totalKm > 0)
            ? round($totalKm / $totalDieselLiters, 2)
            : null;

        $driver = $truck->defaultDriver;
        $driverName = $driver ? trim($driver->first_name.' '.$driver->last_name) : null;

        $activeDriver = $activeTrip?->staff;
        $activeDriverName = $activeDriver ? trim($activeDriver->first_name.' '.$activeDriver->last_name) : null;

        return [
            'id' => (int) $truck->id,
            'vehicle_code' => 'VEH-'.str_pad((string) $truck->id, 3, '0', STR_PAD_LEFT),
            'register' => $truck->register,
            'model_id' => (int) $truck->model_id,
            'model_name' => $truck->vehicleModel?->mane ?? 'Unknown Model',
            'default_staff_id' => $truck->default_staff_id ? (int) $truck->default_staff_id : null,
            'default_driver_name' => $driverName,
            'default_driver_mobile' => $driver?->mobile,
            'current_km' => $currentKm,
            'fuel_efficiency' => $truck->fuel_efficiency !== null ? round((float) $truck->fuel_efficiency, 2) : $measuredEfficiency,
            'measured_efficiency' => $measuredEfficiency,
            'status' => $effectiveStatus,
            'active_trip_id' => $activeTrip ? (int) $activeTrip->id : null,
            'active_trip_destination' => $activeTrip?->destination,
            'active_trip_driver_id' => $activeTrip ? (int) $activeTrip->staff_id : null,
            'active_trip_driver_name' => $activeDriverName,
            'trips_count' => $trips->count(),
            'completed_trips_count' => $completedTrips->count(),
            'total_km' => $totalKm,
            'total_diesel_liters' => $totalDieselLiters,
            'total_diesel_cost' => $totalDieselCost,
        ];
    }

    /**
     * Format a Transport trip model into an enriched UI array.
     *
     * @return array<string, mixed>
     */
    public function formatTransport(Transport $trip, float $fallbackDieselRate = 286.00): array
    {
        $isCompleted = $trip->end !== null;
        $startKm = (int) $trip->start_km;
        $endKm = $trip->end_km !== null ? (int) $trip->end_km : null;
        $distanceKm = $isCompleted && $endKm !== null
            ? max(0, $endKm - $startKm)
            : (int) ($trip->junry ?? 0);

        $dieselRate = (float) ($trip->desialPrice?->price ?? $fallbackDieselRate);
        $dieselLiters = $trip->diesel_liters !== null ? round((float) $trip->diesel_liters, 3) : null;
        $dieselCost = $trip->diesel_cost !== null
            ? round((float) $trip->diesel_cost, 2)
            : ($dieselLiters !== null ? round($dieselLiters * $dieselRate, 2) : null);

        $actualKmPerLiter = ($dieselLiters !== null && $dieselLiters > 0 && $distanceKm > 0)
            ? round($distanceKm / $dieselLiters, 2)
            : null;

        $driver = $trip->staff;
        $driverName = $driver ? trim($driver->first_name.' '.$driver->last_name) : 'Unassigned';

        $job = $trip->printJob;
        $jobCode = $job ? ('JOB-'.str_pad((string) $job->id, 4, '0', STR_PAD_LEFT)) : null;

        return [
            'id' => (int) $trip->id,
            'trip_code' => 'TRP-'.str_pad((string) $trip->id, 4, '0', STR_PAD_LEFT),
            'status' => $isCompleted ? 'Completed' : 'In Transit',
            'is_completed' => $isCompleted,
            'truck_id' => (int) $trip->truck_id,
            'truck_register' => $trip->truck?->register ?? ('Truck #'.$trip->truck_id),
            'truck_model' => $trip->truck?->vehicleModel?->mane ?? '',
            'truck_efficiency' => $trip->truck?->fuel_efficiency !== null ? round((float) $trip->truck->fuel_efficiency, 2) : null,
            'staff_id' => (int) $trip->staff_id,
            'driver_name' => $driverName,
            'driver_mobile' => $driver?->mobile ?? '',
            'driver_type' => $driver?->staffType?->staff_type ?? 'Driver',
            'start' => $trip->start ? Carbon::parse($trip->start)->format('Y-m-d\TH:i') : null,
            'start_formatted' => $trip->start ? Carbon::parse($trip->start)->format('M d, Y h:i A') : '—',
            'start_date' => $trip->start ? Carbon::parse($trip->start)->toDateString() : '',
            'end' => $trip->end ? Carbon::parse($trip->end)->format('Y-m-d\TH:i') : null,
            'end_formatted' => $trip->end ? Carbon::parse($trip->end)->format('M d, Y h:i A') : 'In Transit',
            'start_km' => $startKm,
            'end_km' => $endKm,
            'junry' => $distanceKm,
            'distance_km' => $distanceKm,
            'desial_price_id' => (int) $trip->desial_price_id,
            'diesel_rate' => round($dieselRate, 2),
            'diesel_liters' => $dieselLiters,
            'diesel_cost' => $dieselCost,
            'actual_km_per_liter' => $actualKmPerLiter,
            'destination' => $trip->destination ?? '',
            'print_jobs_id' => $trip->print_jobs_id ? (int) $trip->print_jobs_id : null,
            'print_job_code' => $jobCode,
            'print_job_customer' => $job?->customer?->name,
            'notes' => $trip->notes ?? '',
        ];
    }

    /**
     * Add a new vehicle (truck) and optionally create its vehicle model inline.
     *
     * @param  array<string, mixed>  $data
     */
    public function createVehicle(array $data): Truck
    {
        return DB::transaction(function () use ($data): Truck {
            $modelId = $this->resolveModelId($data);
            $register = strtoupper(trim((string) $data['register']));

            if (Truck::query()->where('register', $register)->exists()) {
                throw ValidationException::withMessages([
                    'register' => ["A vehicle with registration number '{$register}' already exists."],
                ]);
            }

            $truck = Truck::create([
                'register' => $register,
                'model_id' => $modelId,
                'default_staff_id' => ! empty($data['default_staff_id']) ? (int) $data['default_staff_id'] : null,
                'current_km' => max(0, (int) ($data['current_km'] ?? 0)),
                'fuel_efficiency' => isset($data['fuel_efficiency']) && $data['fuel_efficiency'] !== '' && $data['fuel_efficiency'] !== null
                    ? round((float) $data['fuel_efficiency'], 2)
                    : null,
                'status' => in_array($data['status'] ?? 'Available', ['Available', 'Maintenance'], true)
                    ? $data['status']
                    : 'Available',
            ]);

            if (! empty($data['default_staff_id'])) {
                $this->ensureDriverRole((int) $data['default_staff_id']);
            }

            $this->bumpLiveSync();

            return $truck->load(['vehicleModel', 'defaultDriver.staffType', 'transports']);
        });
    }

    /**
     * Update an existing vehicle's registration, model, driver, odometer, or status.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateVehicle(Truck $truck, array $data): Truck
    {
        return DB::transaction(function () use ($truck, $data): Truck {
            $modelId = $this->resolveModelId($data, (int) $truck->model_id);
            $register = isset($data['register']) ? strtoupper(trim((string) $data['register'])) : $truck->register;

            $duplicate = Truck::query()
                ->where('register', $register)
                ->where('id', '!=', $truck->id)
                ->exists();

            if ($duplicate) {
                throw ValidationException::withMessages([
                    'register' => ["Another vehicle already uses registration number '{$register}'."],
                ]);
            }

            $hasActiveTrip = Transport::query()
                ->where('truck_id', $truck->id)
                ->whereNull('end')
                ->exists();

            $requestedStatus = $data['status'] ?? $truck->status ?? 'Available';
            if ($hasActiveTrip && $requestedStatus === 'Maintenance') {
                throw ValidationException::withMessages([
                    'status' => ['Cannot move vehicle to Maintenance while it has an active In-Transit trip. Complete the trip first.'],
                ]);
            }

            $finalStatus = $hasActiveTrip
                ? 'On Trip'
                : (in_array($requestedStatus, ['Available', 'Maintenance'], true) ? $requestedStatus : 'Available');

            $defaultStaffId = array_key_exists('default_staff_id', $data)
                ? (! empty($data['default_staff_id']) ? (int) $data['default_staff_id'] : null)
                : $truck->default_staff_id;

            $truck->update([
                'register' => $register,
                'model_id' => $modelId,
                'default_staff_id' => $defaultStaffId,
                'current_km' => isset($data['current_km']) ? max(0, (int) $data['current_km']) : (int) $truck->current_km,
                'fuel_efficiency' => array_key_exists('fuel_efficiency', $data)
                    ? ($data['fuel_efficiency'] !== '' && $data['fuel_efficiency'] !== null ? round((float) $data['fuel_efficiency'], 2) : null)
                    : $truck->fuel_efficiency,
                'status' => $finalStatus,
            ]);

            if ($defaultStaffId !== null) {
                $this->ensureDriverRole($defaultStaffId);
            }

            $this->bumpLiveSync();

            return $truck->fresh(['vehicleModel', 'defaultDriver.staffType', 'transports']) ?? $truck;
        });
    }

    /**
     * Assign or unassign a default driver on a vehicle, optionally updating its active trip driver.
     */
    public function assignVehicleDriver(Truck $truck, ?int $staffId, bool $applyToActiveTrip = true): Truck
    {
        return DB::transaction(function () use ($truck, $staffId, $applyToActiveTrip): Truck {
            $truck->update([
                'default_staff_id' => $staffId,
            ]);

            if ($staffId !== null) {
                $this->ensureDriverRole($staffId);

                if ($applyToActiveTrip) {
                    Transport::query()
                        ->where('truck_id', $truck->id)
                        ->whereNull('end')
                        ->update(['staff_id' => $staffId]);
                }
            }

            $this->bumpLiveSync();

            return $truck->fresh(['vehicleModel', 'defaultDriver.staffType', 'transports']) ?? $truck;
        });
    }

    /**
     * Delete a vehicle if it has no recorded transport history.
     */
    public function deleteVehicle(Truck $truck): void
    {
        if ($truck->transports()->exists()) {
            throw ValidationException::withMessages([
                'truck' => ['This vehicle has recorded transport trips and cannot be deleted. Set its status to Maintenance instead.'],
            ]);
        }

        $truck->delete();
        $this->bumpLiveSync();
    }

    /**
     * Create a new vehicle model in the `model` table.
     */
    public function createVehicleModel(string $name): VehicleModel
    {
        $trimmed = trim($name);
        $model = VehicleModel::firstOrCreate(['mane' => $trimmed]);
        $this->bumpLiveSync();

        return $model;
    }

    /**
     * Start a new transport dispatch (assigning vehicle, driver, start odometer, and route).
     *
     * @param  array<string, mixed>  $data
     */
    public function startDispatch(array $data): Transport
    {
        return DB::transaction(function () use ($data): Transport {
            $truck = Truck::query()->lockForUpdate()->findOrFail((int) $data['truck_id']);

            if ($truck->status === 'Maintenance') {
                throw ValidationException::withMessages([
                    'truck_id' => ["Vehicle {$truck->register} is currently marked under Maintenance."],
                ]);
            }

            $openTruckTrip = Transport::query()
                ->where('truck_id', $truck->id)
                ->whereNull('end')
                ->exists();

            if ($openTruckTrip) {
                throw ValidationException::withMessages([
                    'truck_id' => ["Vehicle {$truck->register} is already out on an active In-Transit trip. Complete that trip first."],
                ]);
            }

            $staffId = (int) $data['staff_id'];
            $openDriverTrip = Transport::query()
                ->with('truck')
                ->where('staff_id', $staffId)
                ->whereNull('end')
                ->first();

            if ($openDriverTrip) {
                $otherReg = $openDriverTrip->truck?->register ?? ('Truck #'.$openDriverTrip->truck_id);
                throw ValidationException::withMessages([
                    'staff_id' => ["Selected driver is currently assigned to active trip on {$otherReg}."],
                ]);
            }

            $dieselPrice = ! empty($data['desial_price_id'])
                ? DesialPrice::query()->find((int) $data['desial_price_id'])
                : DesialPrice::query()->orderByDesc('add_date')->orderByDesc('id')->first();

            if (! $dieselPrice) {
                $dieselPrice = DesialPrice::create([
                    'price' => 286.00,
                    'add_date' => today()->toDateString(),
                ]);
            }

            $startKm = isset($data['start_km']) && $data['start_km'] !== ''
                ? max(0, (int) $data['start_km'])
                : max(0, (int) $truck->current_km);

            $startTime = ! empty($data['start']) ? Carbon::parse($data['start']) : now();

            $trip = Transport::create([
                'start' => $startTime,
                'end' => null,
                'start_km' => $startKm,
                'end_km' => null,
                'desial_price_id' => $dieselPrice->id,
                'truck_id' => $truck->id,
                'staff_id' => $staffId,
                'junry' => 0,
                'destination' => ! empty($data['destination']) ? trim((string) $data['destination']) : null,
                'diesel_liters' => null,
                'diesel_cost' => null,
                'print_jobs_id' => ! empty($data['print_jobs_id']) ? (int) $data['print_jobs_id'] : null,
                'notes' => ! empty($data['notes']) ? trim((string) $data['notes']) : null,
            ]);

            $this->ensureDriverRole($staffId);

            $truckUpdates = [
                'status' => 'On Trip',
                'current_km' => max((int) $truck->current_km, $startKm),
            ];
            if (empty($truck->default_staff_id)) {
                $truckUpdates['default_staff_id'] = $staffId;
            }
            $truck->update($truckUpdates);

            $this->bumpLiveSync();

            return $trip->load(['truck.vehicleModel', 'staff.staffType', 'desialPrice', 'printJob.customer']);
        });
    }

    /**
     * Reassign driver on an existing or active transport trip.
     */
    public function assignTripDriver(Transport $transport, int $staffId): Transport
    {
        return DB::transaction(function () use ($transport, $staffId): Transport {
            if ($transport->end === null) {
                $conflict = Transport::query()
                    ->with('truck')
                    ->where('staff_id', $staffId)
                    ->whereNull('end')
                    ->where('id', '!=', $transport->id)
                    ->first();

                if ($conflict) {
                    $reg = $conflict->truck?->register ?? ('Truck #'.$conflict->truck_id);
                    throw ValidationException::withMessages([
                        'staff_id' => ["Selected driver is already driving {$reg} on another active trip."],
                    ]);
                }
            }

            $transport->update(['staff_id' => $staffId]);
            $this->ensureDriverRole($staffId);
            $this->bumpLiveSync();

            return $transport->fresh(['truck.vehicleModel', 'staff.staffType', 'desialPrice', 'printJob.customer']) ?? $transport;
        });
    }

    /**
     * Complete a transport trip, calculate distance (`junry`), record diesel liters & diesel cost, and update vehicle odometer.
     *
     * @param  array<string, mixed>  $data
     */
    public function completeDispatch(Transport $transport, array $data): Transport
    {
        return DB::transaction(function () use ($transport, $data): Transport {
            $endKm = (int) $data['end_km'];
            $startKm = (int) $transport->start_km;

            if ($endKm < $startKm) {
                throw ValidationException::withMessages([
                    'end_km' => ["Closing odometer ({$endKm} km) cannot be less than starting odometer ({$startKm} km)."],
                ]);
            }

            $endTime = ! empty($data['end']) ? Carbon::parse($data['end']) : now();
            if ($transport->start && $endTime->lt(Carbon::parse($transport->start))) {
                throw ValidationException::withMessages([
                    'end' => ['Trip completion time cannot be earlier than departure time.'],
                ]);
            }

            $dieselPriceId = ! empty($data['desial_price_id'])
                ? (int) $data['desial_price_id']
                : (int) $transport->desial_price_id;

            $dieselPrice = DesialPrice::query()->find($dieselPriceId)
                ?? DesialPrice::query()->orderByDesc('add_date')->orderByDesc('id')->first();

            $rate = $dieselPrice ? (float) $dieselPrice->price : 286.00;
            $distanceKm = max(0, $endKm - $startKm);
            $dieselLiters = round(max(0, (float) $data['diesel_liters']), 3);

            $dieselCost = (isset($data['diesel_cost']) && $data['diesel_cost'] !== '' && $data['diesel_cost'] !== null)
                ? round(max(0, (float) $data['diesel_cost']), 2)
                : round($dieselLiters * $rate, 2);

            $transport->update([
                'end' => $endTime,
                'end_km' => $endKm,
                'junry' => $distanceKm,
                'desial_price_id' => $dieselPrice ? $dieselPrice->id : $transport->desial_price_id,
                'diesel_liters' => $dieselLiters,
                'diesel_cost' => $dieselCost,
                'destination' => array_key_exists('destination', $data) && $data['destination'] !== null
                    ? trim((string) $data['destination'])
                    : $transport->destination,
                'notes' => array_key_exists('notes', $data) && $data['notes'] !== null
                    ? trim((string) $data['notes'])
                    : $transport->notes,
            ]);

            $truck = Truck::query()->find($transport->truck_id);
            if ($truck) {
                $stillOpen = Transport::query()
                    ->where('truck_id', $truck->id)
                    ->whereNull('end')
                    ->exists();

                $truck->update([
                    'current_km' => max((int) $truck->current_km, $endKm),
                    'status' => $stillOpen ? 'On Trip' : ($truck->status === 'Maintenance' ? 'Maintenance' : 'Available'),
                ]);
            }

            $this->bumpLiveSync();

            return $transport->fresh(['truck.vehicleModel', 'staff.staffType', 'desialPrice', 'printJob.customer']) ?? $transport;
        });
    }

    /**
     * Delete a transport trip record and sync its truck availability status.
     */
    public function deleteDispatch(Transport $transport): void
    {
        DB::transaction(function () use ($transport): void {
            $truckId = (int) $transport->truck_id;
            $transport->delete();

            $truck = Truck::query()->find($truckId);
            if ($truck && $truck->status === 'On Trip') {
                $stillOpen = Transport::query()
                    ->where('truck_id', $truck->id)
                    ->whereNull('end')
                    ->exists();

                if (! $stillOpen) {
                    $truck->update(['status' => 'Available']);
                }
            }

            $this->bumpLiveSync();
        });
    }

    /**
     * Add or update a Diesel Price rate (`desial_price` table).
     *
     * @param  array<string, mixed>  $data
     */
    public function saveDieselPrice(array $data): DesialPrice
    {
        $date = ! empty($data['add_date'])
            ? Carbon::parse($data['add_date'])->toDateString()
            : today()->toDateString();

        $dieselPrice = DesialPrice::create([
            'price' => round((float) $data['price'], 2),
            'add_date' => $date,
        ]);

        $this->bumpLiveSync();

        return $dieselPrice;
    }

    /**
     * Register a new driver directly into the HR `staff` table with `Driver` role.
     *
     * @param  array<string, mixed>  $data
     */
    public function registerDriver(array $data, ?int $adminId = null): Staff
    {
        return DB::transaction(function () use ($data, $adminId): Staff {
            $roleName = ! empty($data['role']) && in_array($data['role'], ['Driver', 'Delivery Assistant'], true)
                ? $data['role']
                : 'Driver';

            $driverType = StaffType::firstOrCreate(['staff_type' => $roleName]);
            $activeStatus = StaffStatus::firstOrCreate(['staff_status' => 'Active']);

            $resolvedAdminId = $adminId ?: (int) (Admin::query()->value('id') ?? 1);

            $staff = Staff::create([
                'first_name' => trim((string) $data['first_name']),
                'last_name' => trim((string) $data['last_name']),
                'mobile' => trim((string) $data['mobile']),
                'nic' => strtoupper(trim((string) $data['nic'])),
                'staff_statuses_id' => $activeStatus->id,
                'staff_type_id' => $driverType->id,
                'add_at' => now(),
                'add_by' => $resolvedAdminId,
            ]);

            if (! empty($data['assign_truck_id'])) {
                $truck = Truck::query()->find((int) $data['assign_truck_id']);
                if ($truck) {
                    $truck->update(['default_staff_id' => $staff->id]);
                }
            }

            $this->bumpLiveSync(['transport', 'hr']);

            return $staff->load(['staffType', 'status']);
        });
    }

    /**
     * Resolve or create a VehicleModel ID from payload.
     *
     * @param  array<string, mixed>  $data
     */
    protected function resolveModelId(array $data, ?int $fallbackModelId = null): int
    {
        if (! empty($data['new_model_name']) && is_string($data['new_model_name']) && trim($data['new_model_name']) !== '') {
            $model = VehicleModel::firstOrCreate([
                'mane' => trim($data['new_model_name']),
            ]);

            return (int) $model->id;
        }

        if (! empty($data['model_id'])) {
            return (int) $data['model_id'];
        }

        if ($fallbackModelId !== null) {
            return $fallbackModelId;
        }

        throw ValidationException::withMessages([
            'model_id' => ['Please select a vehicle model or enter a new model name.'],
        ]);
    }

    /**
     * Promote a General Staff member to Driver if they do not have a specialized role yet.
     */
    protected function ensureDriverRole(int $staffId): void
    {
        $staff = Staff::with('staffType')->find($staffId);
        if (! $staff) {
            return;
        }

        $currentType = strtolower((string) ($staff->staffType?->staff_type ?? ''));
        if ($currentType === '' || $currentType === 'general staff') {
            $driverType = StaffType::firstOrCreate(['staff_type' => 'Driver']);
            $staff->update(['staff_type_id' => $driverType->id]);
        }
    }

    /**
     * Bump live-sync channels so open browser tabs refresh automatically.
     *
     * @param  string|list<string>  $channels
     */
    protected function bumpLiveSync(string|array $channels = 'transport'): void
    {
        try {
            app(LiveSyncService::class)->bump($channels);
        } catch (\Throwable) {
            // Non-blocking live-sync notification
        }
    }
}
