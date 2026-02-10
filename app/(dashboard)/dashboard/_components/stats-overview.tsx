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
  return (
    <div className="flex items-center gap-8 text-sm text-gray-600 py-4 border-b border-gray-100">
      <div>
        <span className="font-semibold text-gray-900 text-lg">
          {totalProjects}
        </span>
        <span className="ml-1.5">projects</span>
      </div>
      <div>
        <span className="font-semibold text-gray-900 text-lg">
          {activeProjects}
        </span>
        <span className="ml-1.5">active</span>
      </div>
      <div>
        <span className="font-semibold text-gray-900 text-lg">
          {totalLogs.toLocaleString()}
        </span>
        <span className="ml-1.5">logs</span>
      </div>
      <div>
        <span className="font-semibold text-gray-900 text-lg">
          {totalSummaries}
        </span>
        <span className="ml-1.5">summaries</span>
      </div>
    </div>
  );
}
