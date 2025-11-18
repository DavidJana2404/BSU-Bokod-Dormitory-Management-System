<x-mail::message>
# Welcome to {{ $dormitoryName ?? 'Our Dormitory' }}!

Dear {{ $student->first_name }} {{ $student->last_name }},

We are delighted to inform you that your application has been approved! Welcome to our dormitory community.

**Your Details:**
- **Dormitorian ID:** {{ $student->student_id }}
- **Email:** {{ $student->email }}
- **Phone:** {{ $student->phone }}

## Next Steps

Your account has been created successfully. You can now log in to the system using the following credentials:

**Login Email:** {{ $student->email }}<br>
**Default Password:** Password123

<x-mail::button :url="route('login')">
Log In Now
</x-mail::button>

**Important:** For security reasons, we recommend changing your password after your first login.

Once you log in, you will be able to:
- Access your dormitory account
- View room assignments
- Make payments
- Access other dormitory services

If you have any questions or need assistance, please don't hesitate to contact the dormitory administration.

We look forward to having you as part of our community!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
