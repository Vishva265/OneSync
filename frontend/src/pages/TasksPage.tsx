import { useQuery } from "@tanstack/react-query"
import { tasksApi } from "@/api/tasks"
import { projectsApi } from "@/api/projects"

export function TasksPage() {
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: async () => (await projectsApi.getAll()).data })
  // naive: show tasks of first project selected
  const projectId = projects[0]?.id
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks", projectId], queryFn: async () => projectId ? (await tasksApi.getByProject(projectId)).data : [], enabled: !!projectId })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tasks.map((t: any) => (
          <div key={t.id} className="border rounded p-3 bg-white">
            <div className="text-sm text-gray-500">{t.state}</div>
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-gray-600">{t.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default TasksPage
