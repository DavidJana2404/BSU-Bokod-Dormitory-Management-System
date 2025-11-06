<x-mail::message>
# Welcome to {{ $dormitoryName ?? 'Our Dormitory' }}!

Dear {{ $student->first_name }} {{ $student->last_name }},

We are delighted to inform you that your application has been approved! Welcome to our dormitory community.

**Your Details:**
- **Dormitorian ID:** {{ $student->student_id }}
- **Email:** {{ $student->email }}
- **Phone:** {{ $student->phone }}

## Next Steps

Your account has been created successfully. Please **wait for your login credentials** to be set up by our dormitory manager. You will receive another email shortly with your password and login instructions.

Once you receive your login credentials, you will be able to:
- Access your dormitory account
- View room assignments
- Make payments
- Access other dormitory services

If you have any questions or need assistance, please don't hesitate to contact the dormitory administration.

We look forward to having you as part of our community!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
