<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PhilippinePhoneNumber implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Remove all non-digit characters for validation
        $cleanedNumber = preg_replace('/[^0-9]/', '', $value);
        
        if (!$this->isValidPhilippineNumber($cleanedNumber)) {
            $fail('The :attribute must be a valid Philippine phone number.');
        }
    }
    
    /**
     * Check if the number is a valid Philippine phone number
     *
     * @param string $number
     * @return bool
     */
    private function isValidPhilippineNumber(string $number): bool
    {
        // Philippine mobile numbers (11 digits starting with 09)
        if (preg_match('/^09\d{9}$/', $number)) {
            return true;
        }
        
        // Philippine mobile numbers with country code (13 digits starting with 639)
        if (preg_match('/^639\d{9}$/', $number)) {
            return true;
        }
        
        // Philippine mobile numbers without country code prefix (10 digits starting with 9)
        if (preg_match('/^9\d{9}$/', $number)) {
            return true;
        }
        
        // Metro Manila landlines with area code 02 (10 digits total: 02 + 8 digits)
        if (preg_match('/^02[2-8]\d{7}$/', $number)) {
            return true;
        }
        
        // Metro Manila landlines with area code 02 (9 digits total: 02 + 7 digits)
        if (preg_match('/^02[2-8]\d{6}$/', $number)) {
            return true;
        }
        
        // Metro Manila landlines without area code (8 digits starting with 2-8)
        if (preg_match('/^[2-8]\d{7}$/', $number)) {
            return true;
        }
        
        // Metro Manila landlines without area code (7 digits starting with 2-8) - older format
        if (preg_match('/^[2-8]\d{6}$/', $number)) {
            return true;
        }
        
        // Provincial landlines with area codes
        // Format: 0 + Area code (2 digits) + local number (6-7 digits) = 9-10 digits total
        if (preg_match('/^0\d{8,9}$/', $number)) {
            // Major area codes in the Philippines (with leading 0)
            $validAreaCodes = [
                '032', '033', '034', '035', '036', '038', // Western Visayas
                '042', '043', '044', '045', '046', '047', '048', '049', // CALABARZON
                '052', '053', '054', '055', '056', // Bicol
                '062', '063', '064', '065', '068', // Eastern Visayas
                '072', '074', '075', '077', '078', // Central Visayas
                '082', '083', '084', '085', '086', '087', '088' // Mindanao
            ];
            
            foreach ($validAreaCodes as $areaCode) {
                // Match 0 + area code + 6-7 digit local number
                if (preg_match('/^' . $areaCode . '\d{6,7}$/', $number)) {
                    return true;
                }
            }
        }
        
        // Provincial landlines without leading zero (for direct area code formats)
        if (preg_match('/^\d{8,9}$/', $number)) {
            // Major area codes without leading 0
            $validAreaCodes = [
                '32', '33', '34', '35', '36', '38', // Western Visayas
                '42', '43', '44', '45', '46', '47', '48', '49', // CALABARZON
                '52', '53', '54', '55', '56', // Bicol
                '62', '63', '64', '65', '68', // Eastern Visayas
                '72', '74', '75', '77', '78', // Central Visayas
                '82', '83', '84', '85', '86', '87', '88' // Mindanao
            ];
            
            foreach ($validAreaCodes as $areaCode) {
                // Match area code + 6-7 digit local number
                if (preg_match('/^' . $areaCode . '\d{6,7}$/', $number)) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
