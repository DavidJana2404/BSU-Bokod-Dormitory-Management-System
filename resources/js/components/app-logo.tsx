export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-white dark:bg-white">
                <img src="/dorm.png" alt="Dormitory Logo" className="w-full h-full object-cover" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">DORMITORY MANAGEMENT SYSTEM</span>
            </div>
        </>
    );
}
