<x-mail::message>
# Your Login Credentials Are Ready!

Dear {{ $student->first_name }} {{ $student->last_name }},

Great news! Your login credentials have been set up by the dormitory manager. You can now access your account.

**Your Login Credentials:**
- **Email:** {{ $student->email }}
- **Student ID:** {{ $student->student_id }}
- **Temporary Password:** {{ $password }}

<x-mail::button :url="$loginUrl">
Login to Your Account
</x-mail::button>

## Important Security Note

For your security, we strongly recommend that you **change your password** immediately after logging in for the first time.

**Steps to login:**
1. Click the button above or visit the login page
2. Enter your email address
3. Enter the temporary password provided above
4. After logging in, please change your password in your account settings

If you have any issues logging in or need assistance, please contact the dormitory administration.

Welcome aboard!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
