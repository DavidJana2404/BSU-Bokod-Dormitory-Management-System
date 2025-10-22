<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Dormitory Address
    |--------------------------------------------------------------------------
    |
    | This is the default address used when creating new dormitories.
    | It will be taken from the Boys dormitory, or you can set a fallback here.
    |
    */
    'default_address' => env('DEFAULT_DORMITORY_ADDRESS', 'P.O. Box 123, Main Campus'),

    /*
    |--------------------------------------------------------------------------
    | Default Contact
    |--------------------------------------------------------------------------
    |
    | This is the default contact used when no manager is assigned yet.
    |
    */
    'default_contact' => env('DEFAULT_DORMITORY_CONTACT', 'manager@dormitory.com'),
];
