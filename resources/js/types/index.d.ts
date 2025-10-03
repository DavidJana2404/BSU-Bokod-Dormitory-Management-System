import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title?: string;
    label?: string;
    href?: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    appearance: 'light' | 'dark' | 'system';
    [key: string]: unknown;
}

export interface PageProps {
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Student {
    student_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Dormitory {
    tenant_id: number;
    dormitory_name: string;
    address: string;
    contact_number: string;
    room_count?: number;
    available_rooms?: number;
    occupied_rooms?: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Room {
    id: number;
    room_number: string;
    tenant_id: number;
    capacity: number;
    current_occupancy: number;
    status: 'available' | 'occupied' | 'maintenance';
    type?: string;
    price?: number;
    description?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Booking {
    id: number;
    student_id: number;
    room_id: number;
    tenant_id: number;
    semester_count: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    total_amount?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    student?: Student;
    room?: Room;
    dormitory?: Dormitory;
    [key: string]: unknown;
}

export interface CleaningSchedule {
    id: number;
    room_id: number;
    day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = Monday, 7 = Sunday
    day_name: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    room_number?: string;
    created_at: string;
    updated_at: string;
    room?: Room;
    [key: string]: unknown;
}

export interface CleaningScheduleData {
    rooms: {
        room_id: number;
        room_number: string;
        cleaning_schedules: CleaningSchedule[];
    }[];
    weeklySchedule: {
        [key: number]: CleaningSchedule[];
    };
}

export interface StudentCleaningSchedule {
    id: number;
    day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    day_name: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    room_id: number;
}

export interface StudentDashboardProps {
    student: {
        student_id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        status: 'in' | 'on_leave';
        leave_reason?: string | null;
        status_updated_at?: string | null;
        current_booking?: {
            id: number;
            semester_count: number;
            total_fee: number;
            room?: {
                id: number;
                room_number: string;
                room_type: string;
            } | null;
        } | null;
    };
    cleaningSchedules: StudentCleaningSchedule[];
}
