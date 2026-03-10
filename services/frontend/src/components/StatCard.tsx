interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: number;
}

export default function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg hover:border-blue-500/50 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          {trend !== undefined && (
            <p className={`text-xs mt-2 ${trend > 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs última hora
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
    </div>
  );
}
