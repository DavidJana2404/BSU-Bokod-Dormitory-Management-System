import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], label = 'Navigation' }: { items: NavItem[]; label?: string }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-0 py-2">
            <SidebarGroupLabel className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => {
                    const isActive = page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className={`
                                    mx-2 rounded-lg transition-all duration-200
                                    ${isActive 
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium' 
                                        : 'hover:bg-accent hover:text-accent-foreground'
                                    }
                                `}
                            >
                                <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                                    {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                                    <span className="flex-1">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
