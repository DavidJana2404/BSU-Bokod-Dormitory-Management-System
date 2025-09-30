import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { StudentMenuContent } from '@/components/student-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronsUpDown } from 'lucide-react';

import { type Student, type User } from '@/types';

interface StudentNavUserProps {
    student?: Student;
}

export function StudentNavUser({ student }: StudentNavUserProps) {
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    // Use provided student data or fallback to defaults
    const studentData = student || {
        student_id: 0,
        first_name: 'Student',
        last_name: 'User',
        email: 'student@example.com',
        phone: '',
        created_at: '',
        updated_at: ''
    } as Student;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent">
                            <UserInfo user={{
                                id: studentData.student_id || 0,
                                name: `${studentData.first_name} ${studentData.last_name}`,
                                email: studentData.email,
                                email_verified_at: null,
                                created_at: '',
                                updated_at: ''
                            } as User} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                    >
                        <StudentMenuContent student={studentData} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}