import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';
import { StudentNavUser } from './student-nav-user';

const studentNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/student/dashboard',
        icon: LayoutGrid,
    },
];


interface StudentSidebarProps {
    student?: any;
}

export function StudentSidebar({ student: propStudent }: StudentSidebarProps = {}) {
    const { props } = usePage();
    const student = propStudent || (props as any).student;
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/student/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={studentNavItems} label="Student Menu" />
            </SidebarContent>

            <SidebarFooter>
                <StudentNavUser student={student} />
            </SidebarFooter>
        </Sidebar>
    );
}