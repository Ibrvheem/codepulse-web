import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle } from "lucide-react";

interface Project {
  id: string;
  name: string;
  updatedAt: string;
  _count: {
    rawLogs: number;
  };
}

interface RecentActivityProps {
  projects: Project[];
}

export function RecentActivity({ projects }: RecentActivityProps) {
  const recentProjects = projects
    ?.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 3);

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Clock className="w-5 h-5 mr-2 text-gray-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProjects?.map((project) => (
            <div key={project.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {project.name}
                </p>
                <p className="text-xs text-gray-500">
                  {project._count.rawLogs > 0
                    ? `${project._count.rawLogs} logs`
                    : "No activity"}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

          {recentProjects?.length === 0 && (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
