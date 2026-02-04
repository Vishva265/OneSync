import { useQuery } from "@tanstack/react-query"
import { timesheetsApi } from "@/api/timesheets"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"

export function TimesheetList({ projectId }: { projectId: string }) {
  const { data: timesheets = [] } = useQuery({
    queryKey: ["timesheets", projectId],
    queryFn: async () => {
      const res = await timesheetsApi.getAll({ project: projectId })
      return res.data
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Timesheets</h3>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">+ Log Time</Button>
      </div>

      <div className="space-y-2">
        {timesheets.map((ts) => (
          <Card key={ts.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {ts.durationHours}h @ ${ts.hourlyRate}/h
                </p>
                <p className="text-sm text-gray-600">{new Date(ts.workDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    ts.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : ts.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {ts.status}
                </span>
                <span className="text-sm font-semibold">${ts.amount}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
