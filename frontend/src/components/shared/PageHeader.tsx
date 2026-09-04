interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ElementType;
}

export function PageHeader({ title, description, actions, icon: Icon }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-2.5 rounded-xl text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, hsl(175 84% 18%), hsl(190 80% 38%))' }}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 mt-0.5 font-medium">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
