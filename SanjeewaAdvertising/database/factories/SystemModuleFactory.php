<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\User\Models\SystemModule;

/**
 * @extends Factory<SystemModule>
 */
class SystemModuleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<SystemModule>
     */
    protected $model = SystemModule::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'system_module' => fake()->unique()->word(),
        ];
    }
}
