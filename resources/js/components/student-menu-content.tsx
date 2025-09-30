import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User, type Student } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Key, Palette } from 'lucide-react';

interface StudentMenuContentProps {
    student: Student;
}

export function StudentMenuContent({ student }: StudentMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
        router.post('/logout');
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={{
                        id: student?.student_id || 0,
                        name: `${student?.first_name || ''} ${student?.last_name || ''}`,
                        email: student?.email || '',
                        email_verified_at: null,
                        created_at: '',
                        updated_at: ''
                    } as User} showEmail />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/student/settings/password" as="button" prefetch onClick={cleanup}>
                        <Key className="mr-2" />
                        Change Password
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/student/settings/appearance" as="button" prefetch onClick={cleanup}>
                        <Palette className="mr-2" />
                        Appearance
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button className="block w-full text-left" onClick={handleLogout}>
                    <LogOut className="mr-2" />
                    Log out
                </button>
            </DropdownMenuItem>
        </>
    );
}