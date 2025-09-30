import StudentSidebarLayoutTemplate from '@/layouts/student/student-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface StudentAppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    student?: any;
}

export default ({ children, breadcrumbs, student, ...props }: StudentAppLayoutProps) => (
    <StudentSidebarLayoutTemplate breadcrumbs={breadcrumbs} student={student} {...props}>
        {children}
    </StudentSidebarLayoutTemplate>
);
