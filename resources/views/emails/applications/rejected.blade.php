<x-mail::message>
# Application Status Update

Dear {{ $application->first_name }} {{ $application->last_name }},

Thank you for your interest in joining {{ $dormitoryName ?? 'our dormitory' }}.

After careful review, we regret to inform you that we are unable to approve your application at this time.

**Reason:**

{{ $rejectionReason }}

## What's Next?

If you believe this decision was made in error or if your circumstances have changed, you are welcome to submit a new application in the future.

If you have any questions regarding this decision, please feel free to contact the dormitory administration for clarification.

Thank you for your understanding.

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
