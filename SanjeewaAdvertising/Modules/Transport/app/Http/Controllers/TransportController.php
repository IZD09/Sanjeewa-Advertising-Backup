<?php

namespace Modules\Transport\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Transport\Models\Transport;
use Modules\Transport\Models\Truck;
use Modules\Transport\Services\TransportService;

class TransportController extends Controller
{
    public function __construct(
        protected TransportService $transportService
    ) {}

    /**
     * Display the Admin Transport & Fleet Management page.
     */
    public function index(): View
    {
        $dashboardData = $this->transportService->getTransportDashboardData();

        return view('ui::layouts.admin.pages.transport.transport', [
            'kpi' => $dashboardData['kpi'],
            'initialTransportData' => $dashboardData,
        ]);
    }

    /**
     * Return full JSON summary and tables data for the Transport module.
     */
    public function data(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->transportService->getTransportDashboardData(),
        ]);
    }

    /**
     * Store a newly registered fleet vehicle (`truck` + optional inline `model`).
     */
    public function storeVehicle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'register' => ['required', 'string', 'max:20'],
            'model_id' => ['nullable', 'integer', 'exists:model,id'],
            'new_model_name' => ['nullable', 'string', 'max:45'],
            'default_staff_id' => ['nullable', 'integer', 'exists:staff,id'],
            'current_km' => ['nullable', 'integer', 'min:0'],
            'fuel_efficiency' => ['nullable', 'numeric', 'min:0.1', 'max:999'],
            'status' => ['nullable', 'string', 'in:Available,Maintenance'],
        ]);

        $truck = $this->transportService->createVehicle($validated);

        return response()->json([
            'success' => true,
            'message' => "Vehicle {$truck->register} added to fleet successfully.",
            'data' => $this->transportService->formatTruck($truck),
        ], 201);
    }

    /**
     * Update an existing vehicle's details.
     */
    public function updateVehicle(Request $request, Truck $truck): JsonResponse
    {
        $validated = $request->validate([
            'register' => ['sometimes', 'required', 'string', 'max:20'],
            'model_id' => ['nullable', 'integer', 'exists:model,id'],
            'new_model_name' => ['nullable', 'string', 'max:45'],
            'default_staff_id' => ['nullable', 'integer', 'exists:staff,id'],
            'current_km' => ['nullable', 'integer', 'min:0'],
            'fuel_efficiency' => ['nullable', 'numeric', 'min:0.1', 'max:999'],
            'status' => ['nullable', 'string', 'in:Available,Maintenance,On Trip'],
        ]);

        $updated = $this->transportService->updateVehicle($truck, $validated);

        return response()->json([
            'success' => true,
            'message' => "Vehicle {$updated->register} updated successfully.",
            'data' => $this->transportService->formatTruck($updated),
        ]);
    }

    /**
     * Assign or unassign a driver to a vehicle (`truck.default_staff_id`).
     */
    public function assignVehicleDriver(Request $request, Truck $truck): JsonResponse
    {
        $validated = $request->validate([
            'staff_id' => ['nullable', 'integer', 'exists:staff,id'],
            'apply_to_active_trip' => ['nullable', 'boolean'],
        ]);

        $staffId = ! empty($validated['staff_id']) ? (int) $validated['staff_id'] : null;
        $applyActive = array_key_exists('apply_to_active_trip', $validated)
            ? (bool) $validated['apply_to_active_trip']
            : true;

        $updated = $this->transportService->assignVehicleDriver($truck, $staffId, $applyActive);

        return response()->json([
            'success' => true,
            'message' => $staffId
                ? "Driver assigned to vehicle {$updated->register} successfully."
                : "Default driver cleared for vehicle {$updated->register}.",
            'data' => $this->transportService->formatTruck($updated),
        ]);
    }

    /**
     * Delete a vehicle with no transport history.
     */
    public function destroyVehicle(Truck $truck): JsonResponse
    {
        $reg = $truck->register;
        $this->transportService->deleteVehicle($truck);

        return response()->json([
            'success' => true,
            'message' => "Vehicle {$reg} removed from fleet.",
        ]);
    }

    /**
     * Store a new vehicle model (`model` table).
     */
    public function storeModel(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:45'],
        ]);

        $model = $this->transportService->createVehicleModel($validated['name']);

        return response()->json([
            'success' => true,
            'message' => "Vehicle model '{$model->mane}' added successfully.",
            'data' => [
                'id' => (int) $model->id,
                'name' => $model->mane,
                'mane' => $model->mane,
            ],
        ], 201);
    }

    /**
     * Start a new transport dispatch trip (`transport` table).
     */
    public function storeTrip(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'truck_id' => ['required', 'integer', 'exists:truck,id'],
            'staff_id' => ['required', 'integer', 'exists:staff,id'],
            'start' => ['nullable', 'date'],
            'start_km' => ['nullable', 'integer', 'min:0'],
            'desial_price_id' => ['nullable', 'integer', 'exists:desial_price,id'],
            'destination' => ['required', 'string', 'max:150'],
            'print_jobs_id' => ['nullable', 'integer', 'exists:print_jobs,id'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $trip = $this->transportService->startDispatch($validated);

        return response()->json([
            'success' => true,
            'message' => 'Transport vehicle dispatched successfully.',
            'data' => $this->transportService->formatTransport($trip),
        ], 201);
    }

    /**
     * Reassign driver on an active or existing transport trip.
     */
    public function assignTripDriver(Request $request, Transport $transport): JsonResponse
    {
        $validated = $request->validate([
            'staff_id' => ['required', 'integer', 'exists:staff,id'],
        ]);

        $updated = $this->transportService->assignTripDriver($transport, (int) $validated['staff_id']);

        return response()->json([
            'success' => true,
            'message' => 'Driver updated for transport trip successfully.',
            'data' => $this->transportService->formatTransport($updated),
        ]);
    }

    /**
     * Complete an active transport trip and record closing odometer & diesel consumption.
     */
    public function completeTrip(Request $request, Transport $transport): JsonResponse
    {
        $validated = $request->validate([
            'end' => ['nullable', 'date'],
            'end_km' => ['required', 'integer', 'min:0'],
            'diesel_liters' => ['required', 'numeric', 'min:0', 'max:99999'],
            'diesel_cost' => ['nullable', 'numeric', 'min:0'],
            'desial_price_id' => ['nullable', 'integer', 'exists:desial_price,id'],
            'destination' => ['nullable', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $completed = $this->transportService->completeDispatch($transport, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Transport completed and diesel consumption recorded successfully.',
            'data' => $this->transportService->formatTransport($completed),
        ]);
    }

    /**
     * Delete a transport trip record.
     */
    public function destroyTrip(Transport $transport): JsonResponse
    {
        $this->transportService->deleteDispatch($transport);

        return response()->json([
            'success' => true,
            'message' => 'Transport trip record deleted successfully.',
        ]);
    }

    /**
     * Add a new Diesel Price per Liter entry (`desial_price` table).
     */
    public function storeDieselPrice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'price' => ['required', 'numeric', 'min:1', 'max:99999'],
            'add_date' => ['nullable', 'date'],
        ]);

        $dieselPrice = $this->transportService->saveDieselPrice($validated);

        return response()->json([
            'success' => true,
            'message' => 'Diesel rate updated to Rs. '.number_format((float) $dieselPrice->price, 2).' per Liter.',
            'data' => [
                'id' => (int) $dieselPrice->id,
                'price' => round((float) $dieselPrice->price, 2),
                'add_date' => $dieselPrice->add_date?->toDateString(),
            ],
        ], 201);
    }

    /**
     * Quick-register a new driver into the HR `staff` directory.
     */
    public function storeDriver(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'mobile' => ['required', 'string', 'max:15'],
            'nic' => ['required', 'string', 'max:15', 'unique:staff,nic'],
            'role' => ['nullable', 'string', 'in:Driver,Delivery Assistant'],
            'assign_truck_id' => ['nullable', 'integer', 'exists:truck,id'],
        ]);

        $adminId = Auth::guard('admin')->id();
        $driver = $this->transportService->registerDriver($validated, $adminId ? (int) $adminId : null);

        return response()->json([
            'success' => true,
            'message' => "Driver {$driver->first_name} {$driver->last_name} registered successfully.",
            'data' => [
                'id' => (int) $driver->id,
                'full_name' => trim($driver->first_name.' '.$driver->last_name),
                'mobile' => $driver->mobile,
                'nic' => $driver->nic,
            ],
        ], 201);
    }
}
