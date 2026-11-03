<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\User\Models\PermisionState;

/**
 * @extends Factory<PermisionState>
 */
class PermisionStateFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<PermisionState>
     */
    protected $model = PermisionState::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'permision_states' => fake()->unique()->word(),
        ];
    }
}
