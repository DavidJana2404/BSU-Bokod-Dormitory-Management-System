<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Rules\PhilippinePhoneNumber;
use Illuminate\Validation\Rule;
use App\Models\Student;

class ApplicationFormRequest extends FormRequest
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
        $applicationId = $this->route('application') ?? $this->route('id');
        
        return [
            'tenant_id' => ['required', 'exists:tenants,tenant_id'],
            'first_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'last_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'email' => [
                'required',
                'string',
                'email:rfc,dns', // Enhanced email validation
                'max:255',
                'lowercase',
                Rule::unique('applications', 'email')->ignore($applicationId, 'id'),
                function ($attribute, $value, $fail) {
                    // Check if email exists in active (non-archived) students
                    $existsInActiveStudents = Student::whereNull('archived_at')
                        ->where('email', $value)
                        ->exists();
                    
                    if ($existsInActiveStudents) {
                        $fail('This email address is already registered to an active student.');
                    }
                },
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
            'additional_info' => ['nullable', 'string', 'max:1000'],
        ];
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
            'email.unique' => 'This email address has already been used for an application.',
            'email.lowercase' => 'The email must be in lowercase.',
            'tenant_id.exists' => 'The selected dormitory is invalid.',
            'additional_info.max' => 'The additional information may not be greater than 1000 characters.',
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
            'tenant_id' => 'dormitory',
            'additional_info' => 'additional information',
        ];
    }
}
