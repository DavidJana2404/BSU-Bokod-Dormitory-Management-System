import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import StudentAppLayout from '@/layouts/student-app-layout';
import StudentSettingsLayout from '@/layouts/student-settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        label: 'Student Portal',
        href: '/student/dashboard',
    },
    {
        label: 'Appearance Settings',
    },
];

export default function StudentAppearance() {
    return (
        <StudentAppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance Settings" />

            <StudentSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title="Appearance settings" 
                        description="Customize your theme and display preferences" 
                    />
                    <AppearanceTabs />
                </div>
            </StudentSettingsLayout>
        </StudentAppLayout>
    );
}