<x-mail::message>
# Room Assignment Confirmation

Dear {{ $student->first_name }} {{ $student->last_name }},

Congratulations! You have been assigned a room at {{ $dormitoryName ?? 'the dormitory' }}.

## Room Details

- **Room Number:** {{ $roomDetails['room_number'] }}
- **Room Type:** {{ ucfirst($roomDetails['room_type']) }}
@if(isset($roomDetails['semester_count']) && $roomDetails['semester_count'])
- **Duration:** {{ $roomDetails['semester_count'] }} semester(s)
- **Total Fee:** ₱{{ number_format($roomDetails['semester_count'] * 2000, 2) }}
@endif
@if(isset($roomDetails['max_capacity']))
- **Room Capacity:** {{ $roomDetails['max_capacity'] }} person(s)
@endif

## Important Information

Please take note of the following:

1. **Payment:** Make sure to settle your dormitory fees at the cashier's office as soon as possible.
2. **Move-in:** Contact the dormitory office to schedule your move-in date and time.
3. **Rules & Regulations:** Please familiarize yourself with the dormitory rules and regulations.
4. **Room Key:** Collect your room key from the dormitory office during your move-in.

## Need Help?

If you have any questions or concerns about your room assignment, please don't hesitate to contact the dormitory management.

We look forward to welcoming you!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
