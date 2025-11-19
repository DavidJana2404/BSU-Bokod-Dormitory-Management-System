export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-white dark:bg-white">
                <img src="/dorm.png" alt="Dormitory Logo" className="w-full h-full object-cover" />
            </div>
            <div className="ml-1 flex flex-1 items-end">
                <span className="text-xs leading-tight font-semibold">DORMITORY MANAGEMENT SYSTEM</span>
            </div>
        </>
    );
}
