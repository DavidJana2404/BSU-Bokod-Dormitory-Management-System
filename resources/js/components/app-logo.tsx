import { useEffect, useState } from 'react';

export default function AppLogo() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check if dark mode is active
        const checkDarkMode = () => {
            const htmlElement = document.documentElement;
            setIsDark(htmlElement.classList.contains('dark'));
        };

        // Initial check
        checkDarkMode();

        // Watch for changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <img 
                    src={isDark ? "/dormwhite.png?v=2" : "/dorm.png?v=2"}
                    alt="Dormitory Logo" 
                    className="w-full h-full object-contain" 
                />
            </div>
            <div className="ml-1 flex flex-1 items-end">
                <span className="text-xs leading-tight font-semibold">DORMITORY MANAGEMENT SYSTEM</span>
            </div>
        </>
    );
}
