type Status = 'new' | 'contacted' | 'archived';

interface StatusConfig {
  label: string;
  className: string;
}

const CONFIG: Record<Status, StatusConfig> = {
  new: { label: 'Nuevo', className: 'bg-blue-50 text-blue-700' },
  contacted: { label: 'Contactado', className: 'bg-green-50 text-green-700' },
  archived: { label: 'Archivado', className: 'bg-slate-100 text-slate-500' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, className } = CONFIG[status] ?? CONFIG.new;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
