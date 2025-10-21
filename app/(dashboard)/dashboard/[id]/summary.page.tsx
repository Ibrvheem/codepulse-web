import Tasks from "../_components/tasks";
import { getSummaries } from "../service";
import { WorkLogSummary } from "../types";

export default async function SingleProjectPage({
  params,
}: {
  params: { summaryId: string };
}) {
  const summaries = (await getSummaries(params.summaryId)) as WorkLogSummary[];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Projects</h2>
      <div className="mx-auto w-full max-w-5xl px-4">
        <Tasks tasks={summaries[0].tasks} />
      </div>

      {/* <ForM setTodos={setTodos} /> */}
      {/* <VanishList /> */}
    </div>
  );
}
