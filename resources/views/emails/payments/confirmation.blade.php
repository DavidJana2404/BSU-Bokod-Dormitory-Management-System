<x-mail::message>
# Payment Received - Thank You!

Dear {{ $student->first_name }} {{ $student->last_name }},

We are pleased to confirm that we have received your payment for {{ $dormitoryName ?? 'the dormitory' }}.

## Payment Details

- **Student ID:** {{ $student->student_id }}
- **Amount Paid:** ₱{{ number_format($paymentDetails['amount_paid'], 2) }}
- **Payment Date:** {{ \Carbon\Carbon::parse($paymentDetails['payment_date'])->format('F d, Y') }}
- **Payment Status:** {{ ucfirst($paymentDetails['payment_status']) }}
@if(isset($paymentDetails['semester_count']) && $paymentDetails['semester_count'])
- **Semester(s) Covered:** {{ $paymentDetails['semester_count'] }} semester(s)
@endif
@if(isset($paymentDetails['room_number']) && $paymentDetails['room_number'])
- **Room Number:** {{ $paymentDetails['room_number'] }}
@endif
@if(isset($paymentDetails['payment_notes']) && $paymentDetails['payment_notes'])
- **Notes:** {{ $paymentDetails['payment_notes'] }}
@endif

Your payment has been successfully recorded in our system. You can now access all dormitory services associated with your account.

If you have any questions regarding your payment or need a receipt, please contact the cashier's office during business hours.

Thank you for your prompt payment!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
