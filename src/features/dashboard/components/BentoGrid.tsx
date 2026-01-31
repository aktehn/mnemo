import { JSX } from 'react';

export const BentoGrid = ({ children, className = "" }: { children: React.ReactNode; className?: string }): JSX.Element => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-[auto_auto_auto] gap-3 max-w-7xl mx-auto ${className}`}>
            {children}
        </div>
    );
};

export const BentoItem = ({
    children,
    className = "",
    span = "col-span-1",
    rowSpan = "row-span-1"
}: {
    children: React.ReactNode;
    className?: string;
    span?: string;
    rowSpan?: string;
}): JSX.Element => {
    return (
        <div className={`${span} ${rowSpan} bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
            {children}
        </div>
    );
};
