<?php

use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Validator;

test('validates passwords with mixed case and numbers', function () {
    $validPasswords = [
        'Password123',     // Mixed case + number
        'Test123abc',      // Mixed case + number
        'MyPass1word',     // Mixed case + number
        'Hello123World',   // Mixed case + number
        'Abc123xyz',       // Mixed case + number
    ];
    
    foreach ($validPasswords as $password) {
        $validator = Validator::make(
            ['password' => $password],
            ['password' => Password::defaults()]
        );
        
        expect($validator->passes())
            ->toBeTrue("Password '{$password}' should be valid but failed validation");
    }
});

test('rejects passwords that do not meet requirements', function () {
    $invalidPasswords = [
        'password',        // No uppercase or numbers
        'PASSWORD',        // No lowercase or numbers
        '12345678',        // No letters
        'Pass123',         // Too short (less than 8 characters)
        'password123',     // No uppercase
        'PASSWORD123',     // No lowercase
        'PassWord',        // No numbers
    ];
    
    foreach ($invalidPasswords as $password) {
        $validator = Validator::make(
            ['password' => $password],
            ['password' => Password::defaults()]
        );
        
        expect($validator->fails())
            ->toBeTrue("Password '{$password}' should be invalid but passed validation");
    }
});

test('accepts passwords without special characters', function () {
    $passwordsWithoutSpecialChars = [
        'SimplePass123',   // No special characters
        'TestPassword1',   // No special characters
        'MyNewPass123',    // No special characters
    ];
    
    foreach ($passwordsWithoutSpecialChars as $password) {
        $validator = Validator::make(
            ['password' => $password],
            ['password' => Password::defaults()]
        );
        
        expect($validator->passes())
            ->toBeTrue("Password '{$password}' without special characters should be valid");
    }
});
