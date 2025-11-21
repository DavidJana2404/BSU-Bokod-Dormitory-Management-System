export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <img 
                    src="/dorm.png" 
                    alt="Dormitory Logo" 
                    className="w-full h-full object-contain dark:hidden" 
                />
                <img 
                    src="/dormwhite.png" 
                    alt="Dormitory Logo" 
                    className="w-full h-full object-contain hidden dark:block" 
                />
            </div>
            <div className="ml-1 flex flex-1 items-end">
                <span className="text-xs leading-tight font-semibold">DORMITORY MANAGEMENT SYSTEM</span>
            </div>
        </>
    );
}
