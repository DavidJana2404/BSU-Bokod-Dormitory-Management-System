<?php

use App\Rules\PhilippinePhoneNumber;
use Illuminate\Support\Facades\Validator;

test('validates valid Philippine mobile numbers', function () {
    $validNumbers = [
        '09171234567',     // Standard mobile format
        '639171234567',    // With country code
        '09281234567',     // Globe
        '09331234567',     // Smart
        '09451234567',     // Sun
    ];
    
    foreach ($validNumbers as $number) {
        $validator = Validator::make(
            ['phone' => $number],
            ['phone' => new PhilippinePhoneNumber]
        );
        
        expect($validator->passes())
            ->toBeTrue("Phone number {$number} should be valid but failed validation");
    }
});

test('rejects invalid Philippine phone numbers', function () {
    $invalidNumbers = [
        '1234567890',      // Not Philippine format
        '09123456',        // Too short
        '091234567890',    // Too long
        '0812345678',      // Wrong prefix
        '+1234567890',     // Wrong country code
        'abc1234567',      // Contains letters
    ];
    
    foreach ($invalidNumbers as $number) {
        $validator = Validator::make(
            ['phone' => $number],
            ['phone' => new PhilippinePhoneNumber]
        );
        
        expect($validator->fails())
            ->toBeTrue("Phone number {$number} should be invalid but passed validation");
    }
});

test('validates Philippine landline numbers', function () {
    $validLandlines = [
        '21234567',        // Metro Manila (8 digits)
        '2123456',         // Metro Manila (7 digits)
        '321234567',       // Iloilo
        '431234567',       // Batangas
        '821234567',       // Davao
        '0281234567',      // Metro Manila with area code
    ];
    
    foreach ($validLandlines as $number) {
        $validator = Validator::make(
            ['phone' => $number],
            ['phone' => new PhilippinePhoneNumber]
        );
        
        expect($validator->passes())
            ->toBeTrue("Landline number {$number} should be valid but failed validation");
    }
});

test('validates formatted phone numbers', function () {
    $formattedNumbers = [
        '+63 917 123 4567',  // Formatted with country code
        '0917 123 4567',     // Formatted mobile
        '(02) 8123-4567',    // Formatted landline
        '917-123-4567',      // Dashed format
    ];
    
    foreach ($formattedNumbers as $number) {
        $validator = Validator::make(
            ['phone' => $number],
            ['phone' => new PhilippinePhoneNumber]
        );
        
        expect($validator->passes())
            ->toBeTrue("Formatted phone number {$number} should be valid but failed validation");
    }
});
