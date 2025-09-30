import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { StudentSidebar } from '@/components/student-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function StudentSidebarLayout({ children, breadcrumbs = [], student }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; student?: any }>) {
    return (
        <AppShell variant="sidebar">
            <StudentSidebar student={student} />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}