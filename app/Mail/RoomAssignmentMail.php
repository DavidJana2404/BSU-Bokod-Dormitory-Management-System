<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RoomAssignmentMail extends Mailable
{
    use Queueable, SerializesModels;

    public $student;
    public $roomDetails;
    public $dormitoryName;

    /**
     * Create a new message instance.
     */
    public function __construct($student, $roomDetails, $dormitoryName = null)
    {
        $this->student = $student;
        $this->roomDetails = $roomDetails;
        $this->dormitoryName = $dormitoryName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Room Assignment Confirmation - ' . ($this->dormitoryName ?? 'BSU Bokod DMS'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.bookings.room-assignment',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
