import { Activity, Database, FileText, BarChart3 } from "lucide-react";

interface StatsOverviewProps {
  totalProjects: number;
  activeProjects: number;
  totalLogs: number;
  totalSummaries: number;
}

export function StatsOverview({
  totalProjects,
  activeProjects,
  totalLogs,
  totalSummaries,
}: StatsOverviewProps) {
  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: Database,
    },
    {
      label: "Active",
      value: activeProjects,
      icon: Activity,
    },
    {
      label: "Logs",
      value: totalLogs.toLocaleString(),
      icon: FileText,
    },
    {
      label: "AI Summaries",
      value: totalSummaries,
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {stats?.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
