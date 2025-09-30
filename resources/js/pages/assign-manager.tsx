
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Users, Building2, Mail, Shield, ShieldCheck, UserCheck, UserX, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { route } from 'ziggy-js';

interface Manager {
id: number;
name: string;
email: string;
dormitory: { tenant_id: number; dormitory_name: string } | null;
is_active: boolean;
}
interface Dormitory {
    tenant_id: number;
    dormitory_name: string;
    manager: { id: number; name: string; email: string } | null;
}

export default function AssignManager() {
const { managers, dormitories } = usePage().props as unknown as { managers: Manager[]; dormitories: Dormitory[] };
const [loading, setLoading] = useState(false);

const unassignedDormitories = dormitories.filter(d => !d.manager);

const handleAssign = (managerId: number, tenantId: number) => {
setLoading(true);
router.post(route('assign-manager.assign', managerId), { tenant_id: tenantId }, {
onSuccess: () => setLoading(false),
onError: () => setLoading(false),
preserveScroll: true,
});
};

return (
<AppLayout breadcrumbs={[{ title: 'Assign Manager', href: '/assign-manager' }]}> 
<Head title="Assign Manager" />
<div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                            <Users className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assign Manager</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage dormitory assignments and user access</p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="flex gap-4">
                        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center min-w-[100px]">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {managers.filter(m => m.is_active).length}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">Active</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center min-w-[100px]">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {managers.filter(m => m.dormitory).length}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">Assigned</div>
                        </div>
                    </div>
                </div>

                {/* Managers Table */}
                {managers && managers.length > 0 ? (
                    <div className="space-y-3">
                        {managers.map((manager) => (
                            <Card key={manager.id} className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-4">
                                    {/* Mobile Layout */}
                                    <div className="block lg:hidden space-y-4">
                                        {/* Manager Info */}
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex-shrink-0">
                                                <Users className="text-blue-600 dark:text-blue-400" size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">{manager.name}</h3>
                                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                        manager.is_active 
                                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                                                    }`}>
                                                        {manager.is_active ? (
                                                            <>
                                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                                                                Active
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></div>
                                                                Inactive
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                                    <Mail size={14} className="text-blue-500" />
                                                    <span className="truncate">{manager.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dormitory Assignment */}
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                            {manager.dormitory ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="text-green-600 dark:text-green-400 flex-shrink-0" size={16} />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Assigned Dormitory</div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {manager.dormitory.dormitory_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full text-sm text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 min-h-[36px]"
                                                        onClick={() => router.post(route('assign-manager.unassign', manager.id))}
                                                        disabled={loading}
                                                    >
                                                        <UserX size={14} className="mr-2" />
                                                        Unassign Dormitory
                                                    </Button>
                                                </div>
                                            ) : (
                                                <form
                                                    onSubmit={e => {
                                                        e.preventDefault();
                                                        const formData = new FormData(e.currentTarget);
                                                        const tenantId = Number(formData.get('tenant_id'));
                                                        if (tenantId) handleAssign(manager.id, tenantId);
                                                    }}
                                                    className="space-y-3"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="text-orange-600 dark:text-orange-400 flex-shrink-0" size={16} />
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Assign Dormitory</div>
                                                    </div>
                                                    <div className="relative">
                                                        <select
                                                            name="tenant_id"
                                                            className="w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            required
                                                            defaultValue=""
                                                            disabled={loading || unassignedDormitories.length === 0}
                                                        >
                                                            <option value="" disabled>
                                                                {unassignedDormitories.length === 0 ? 'No dormitories available' : 'Select dormitory...'}
                                                            </option>
                                                            {unassignedDormitories.map(dormitory => (
                                                                <option key={dormitory.tenant_id} value={dormitory.tenant_id}>
                                                                    {dormitory.dormitory_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        type="submit" 
                                                        disabled={loading || unassignedDormitories.length === 0}
                                                        className="w-full text-sm min-h-[36px]"
                                                    >
                                                        <UserCheck size={14} className="mr-2" />
                                                        {loading ? 'Assigning Dormitory...' : 'Assign Dormitory'}
                                                    </Button>
                                                </form>
                                            )}
                                        </div>

                                        {/* Status Toggle */}
                                        <Button
                                            size="sm"
                                            variant={manager.is_active ? "destructive" : "default"}
                                            onClick={() => router.post(route('users.toggleActive', manager.id))}
                                            disabled={loading}
                                            className="w-full text-sm min-h-[36px]"
                                        >
                                            {manager.is_active ? (
                                                <><Shield size={14} className="mr-2" />Deactivate Manager</>
                                            ) : (
                                                <><ShieldCheck size={14} className="mr-2" />Activate Manager</>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                                        {/* Manager Info - 3 columns */}
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 flex-shrink-0">
                                                    <Users className="text-blue-600 dark:text-blue-400" size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">{manager.name}</h3>
                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                                                        <Mail size={12} className="text-blue-500" />
                                                        <span className="truncate">{manager.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status - 1 column */}
                                        <div className="col-span-1">
                                            <div className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${
                                                manager.is_active 
                                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                                            }`}>
                                                {manager.is_active ? (
                                                    <>
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></div>
                                                        Inactive
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dormitory Assignment - 6 columns */}
                                        <div className="col-span-6">
                                            {manager.dormitory ? (
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                                            <Building2 className="text-green-600 dark:text-green-400 flex-shrink-0" size={14} />
                                                            <div className="min-w-0">
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">Assigned Dormitory</div>
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                    {manager.dormitory.dormitory_name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 ml-2 flex-shrink-0 min-h-[32px] px-3"
                                                            onClick={() => router.post(route('assign-manager.unassign', manager.id))}
                                                            disabled={loading}
                                                        >
                                                            <UserX size={12} className="mr-1" />
                                                            Unassign
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                                    <form
                                                        onSubmit={e => {
                                                            e.preventDefault();
                                                            const formData = new FormData(e.currentTarget);
                                                            const tenantId = Number(formData.get('tenant_id'));
                                                            if (tenantId) handleAssign(manager.id, tenantId);
                                                        }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                                            <Building2 className="text-orange-600 dark:text-orange-400 flex-shrink-0" size={14} />
                                                            <div className="relative flex-1">
                                                                <select
                                                                    name="tenant_id"
                                                                    className="w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                    required
                                                                    defaultValue=""
                                                                    disabled={loading || unassignedDormitories.length === 0}
                                                                >
                                                                    <option value="" disabled>
                                                                        {unassignedDormitories.length === 0 ? 'No dormitories available' : 'Select dormitory...'}
                                                                    </option>
                                                                    {unassignedDormitories.map(dormitory => (
                                                                        <option key={dormitory.tenant_id} value={dormitory.tenant_id}>
                                                                            {dormitory.dormitory_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown className="absolute right-2 top-1.5 h-3 w-3 text-gray-400 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            type="submit" 
                                                            disabled={loading || unassignedDormitories.length === 0}
                                                            className="text-xs flex-shrink-0 min-h-[32px] px-3"
                                                        >
                                                            <UserCheck size={12} className="mr-1" />
                                                            {loading ? 'Assigning...' : 'Assign'}
                                                        </Button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions - 2 columns */}
                                        <div className="col-span-2">
                                            <Button
                                                size="sm"
                                                variant={manager.is_active ? "destructive" : "default"}
                                                onClick={() => router.post(route('users.toggleActive', manager.id))}
                                                disabled={loading}
                                                className="w-full text-xs min-h-[32px]"
                                            >
                                                {manager.is_active ? (
                                                    <><Shield size={12} className="mr-1" />Deactivate</>
                                                ) : (
                                                    <><ShieldCheck size={12} className="mr-1" />Activate</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Users className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No managers found</h3>
                        <p className="text-gray-500 dark:text-gray-500">There are currently no managers in the system.</p>
                    </Card>
                )}
            </div>
</AppLayout>
);
} 