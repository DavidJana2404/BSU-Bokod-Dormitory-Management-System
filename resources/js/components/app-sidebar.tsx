import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bed, Building2, CalendarCheck, LayoutGrid, Users, FileText, Calendar } from 'lucide-react';
import AppLogo from './app-logo';

const managerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Applications',
        href: '/applications',
        icon: FileText,
    },
    {
        title: 'Rooms',
        href: '/rooms',
        icon: Bed,
    },
    {
        title: 'Dormitorians',
        href: '/students',
        icon: Users,
    },
    {
        title: 'Bookings',
        href: '/bookings',
        icon: CalendarCheck,
    },
    {
        title: 'Cleaning Schedules',
        href: '/cleaning-schedules',
        icon: Calendar,
    },
];

// Navigation for managers without tenant assignment
const unassignedManagerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Dormitorians',
        href: '/students',
        icon: Users,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Assign Manager',
        href: '/assign-manager',
        icon: Users,
    },
    {
        title: 'Manage Dormitories',
        href: '/dormitories',
        icon: Building2,
    },
];

const cashierNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/cashier/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Records',
        href: '/cashier/records',
        icon: FileText,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const {auth} = usePage<SharedData>().props;
    const user = auth?.user;
    if(user?.role === 'manager' && !user?.tenant_id){
        return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={unassignedManagerNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
    }
    
    // Cashier role - only show dashboard
    if (auth?.user?.role === 'cashier') {
        return (
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/cashier/dashboard" prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={cashierNavItems} />
                </SidebarContent>

                <SidebarFooter>
                    <NavFooter items={footerNavItems} className="mt-auto" />
                    <NavUser />
                </SidebarFooter>
            </Sidebar>
        );
    }
    
    const isAdmin = auth?.user?.role === 'admin';
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={isAdmin ? adminNavItems: managerNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
