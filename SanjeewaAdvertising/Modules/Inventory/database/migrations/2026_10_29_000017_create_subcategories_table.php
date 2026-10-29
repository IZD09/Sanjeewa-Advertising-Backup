<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subcategories', function (Blueprint $table) {
            $table->increments('id');
            $table->string('subcategory', 50)->unique('subcategory_UNIQUE');
            $table->unsignedInteger('categories_id');

            $table->index('categories_id', 'fk_subcategories_categories1_idx');

            $table->foreign('categories_id', 'fk_subcategories_categories1')
                ->references('id')
                ->on('categories')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subcategories');
    }
};
