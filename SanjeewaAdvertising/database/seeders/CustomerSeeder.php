<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Customer\Models\Customer;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            ['name' => 'Kasun Jayasundara', 'mobile' => '0771234567', 'email' => 'kasun.j@example.com'],
            ['name' => 'Dilhani Senaratne', 'mobile' => '0719876543', 'email' => 'dilhani.s@example.com'],
            ['name' => 'Sajith Warnakula', 'mobile' => '0755554321', 'email' => 'sajith.w@example.com'],
            ['name' => 'Nuwan Weerasinghe', 'mobile' => '0781122334', 'email' => 'nuwan.w@example.com'],
            ['name' => 'Nadeeka Perera', 'mobile' => '0723456789', 'email' => 'nadeeka.p@example.com'],
            ['name' => 'Chaminda Silva', 'mobile' => '0778899001', 'email' => 'chaminda.silva@example.com'],
            ['name' => 'Anura Kumara', 'mobile' => '0771122335', 'email' => 'anura.k@example.com'],
            ['name' => 'Kavinda Wickramasinghe', 'mobile' => '0761234987', 'email' => 'kavinda.w@example.com'],
            ['name' => 'Dinesh Chandimal', 'mobile' => '0776543210', 'email' => 'dinesh.c@example.com'],
            ['name' => 'Malini Fonseka', 'mobile' => '0714455667', 'email' => 'malini.f@example.com'],
            ['name' => 'Roshan Mahanama', 'mobile' => '0773344556', 'email' => 'roshan.m@example.com'],
            ['name' => 'Sanath Jayasuriya', 'mobile' => '0777788990', 'email' => 'sanath.j@example.com'],
            ['name' => 'Ruwan Wijewardene', 'mobile' => '0701122334', 'email' => 'ruwan.w@example.com'],
            ['name' => 'Tharaka Gunaratne', 'mobile' => '0751239874', 'email' => 'tharaka.g@example.com'],
            ['name' => 'Ishara Madushani', 'mobile' => '0789988776', 'email' => 'ishara.m@example.com'],
            ['name' => 'Janaka Bandara', 'mobile' => '0712233445', 'email' => 'janaka.b@example.com'],
            ['name' => 'Pradeep Nishantha', 'mobile' => '0765544332', 'email' => 'pradeep.n@example.com'],
            ['name' => 'Harsha De Silva', 'mobile' => '0772233114', 'email' => 'harsha.d@example.com'],
            ['name' => 'Menaka Rajapaksha', 'mobile' => '0715566778', 'email' => 'menaka.r@example.com'],
            ['name' => 'Gayantha Karunathilaka', 'mobile' => '0754433221', 'email' => 'gayantha.k@example.com'],
            ['name' => 'Lasith Malinga', 'mobile' => '0779911223', 'email' => 'lasith.m@example.com'],
            ['name' => 'Kumar Sangakkara', 'mobile' => '0778800112', 'email' => 'kumar.s@example.com'],
            ['name' => 'Mahela Jayawardena', 'mobile' => '0773300221', 'email' => 'mahela.j@example.com'],
            ['name' => 'Upul Tharanga', 'mobile' => '0766655443', 'email' => 'upul.t@example.com'],
            ['name' => 'Aravinda De Silva', 'mobile' => '0771100998', 'email' => 'aravinda.d@example.com'],
        ];

        foreach ($customers as $cust) {
            Customer::firstOrCreate(
                ['mobile' => $cust['mobile']],
                [
                    'name' => $cust['name'],
                    'email' => $cust['email'],
                    'register_at' => now()->subDays(rand(1, 90)),
                ]
            );
        }
    }
}
