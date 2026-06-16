
type PageHeaderProps = {
    title: string;
    description?: string;
    children?: React.ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-4">
                {children}
            </div>
        </div>
    );
}
