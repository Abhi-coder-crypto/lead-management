interface TopbarProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {actions && (
          <div className="flex items-center space-x-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
