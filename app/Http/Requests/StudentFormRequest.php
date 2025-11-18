<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Rules\PhilippinePhoneNumber;
use Illuminate\Validation\Rule;

class StudentFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization will be handled in controllers
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $studentId = $this->route('student') ?? $this->route('id');
        
        $rules = [
            'first_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'last_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'email' => [
                'required',
                'string',
                'email:rfc,dns', // Enhanced email validation
                'max:255',
                'lowercase',
                Rule::unique('students', 'email')
                    ->ignore($studentId, 'student_id')
                    ->whereNull('archived_at') // Exclude archived students
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                new PhilippinePhoneNumber
            ],
            'parent_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'parent_phone' => [
                'required',
                'string',
                'max:20',
                new PhilippinePhoneNumber
            ],
            'parent_relationship' => ['required', 'string', 'max:50'],
            'check_in_date' => ['nullable', 'date', 'after_or_equal:today'],
            'check_out_date' => ['nullable', 'date', 'after_or_equal:check_in_date'],
        ];
        
        // Password validation only if provided
        if ($this->filled('password')) {
            $rules['password'] = [
                'required',
                'string',
                'min:8',
                'max:255',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/' // At least one uppercase, lowercase, and digit
            ];
            $rules['password_confirmation'] = ['required', 'string'];
        } else {
            $rules['password'] = ['nullable', 'string'];
            $rules['password_confirmation'] = ['nullable', 'string'];
        }
        
        return $rules;
    }
    
    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.regex' => 'The first name may only contain letters, spaces, hyphens, and apostrophes.',
            'last_name.regex' => 'The last name may only contain letters, spaces, hyphens, and apostrophes.',
            'parent_name.regex' => 'The parent/guardian name may only contain letters, spaces, hyphens, and apostrophes.',
            'email.email' => 'The email must be a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'email.lowercase' => 'The email must be in lowercase.',
            'password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, and one digit.',
            'check_in_date.after_or_equal' => 'The check-in date cannot be in the past.',
            'check_out_date.after_or_equal' => 'The check-out date must be on or after the check-in date.',
        ];
    }
    
    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'email' => 'email address',
            'phone' => 'phone number',
            'parent_name' => 'parent/guardian name',
            'parent_phone' => 'parent/guardian phone number',
            'parent_relationship' => 'relationship to parent/guardian',
            'check_in_date' => 'check-in date',
            'check_out_date' => 'check-out date',
        ];
    }
}
