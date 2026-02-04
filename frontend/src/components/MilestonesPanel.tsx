import { useState, useEffect } from "react"
import { milestonesApi } from "@/api/projects"
import type { Milestone } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface MilestonesPanelProps {
  projectId: string
  onRefresh?: () => void
}

export default function MilestonesPanel({ projectId, onRefresh }: MilestonesPanelProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: 0,
    dueDate: "",
  })

  useEffect(() => {
    fetchMilestones()
  }, [projectId])

  const fetchMilestones = async () => {
    setLoading(true)
    try {
      const response = await milestonesApi.getByProject(projectId)
      setMilestones(response.data)
    } catch (error) {
      console.error("Failed to fetch milestones:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await milestonesApi.create(projectId, formData)
      setShowForm(false)
      setFormData({ name: "", description: "", amount: 0, dueDate: "" })
      fetchMilestones()
      onRefresh?.()
    } catch (error) {
      console.error("Failed to create milestone:", error)
      alert("Failed to create milestone")
    }
  }

  const handleMarkDone = async (milestoneId: string) => {
    if (!confirm("Mark this milestone as done?")) return
    try {
      await milestonesApi.markDone(milestoneId)
      fetchMilestones()
      onRefresh?.()
    } catch (error) {
      console.error("Failed to mark milestone done:", error)
      alert("Failed to mark milestone done")
    }
  }

  const handleCreateInvoice = async (milestoneId: string) => {
    if (!confirm("Create invoice from this milestone?")) return
    try {
      await milestonesApi.createInvoice(milestoneId)
      alert("Invoice created successfully!")
      fetchMilestones()
      onRefresh?.()
    } catch (error: any) {
      console.error("Failed to create invoice:", error)
      alert(error.response?.data?.message || "Failed to create invoice")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) return <div className="text-center py-8">Loading milestones...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Milestones</h3>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? "Cancel" : "+ Add Milestone"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 border-2 border-blue-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Milestone Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Design Phase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
                placeholder="Brief description of this milestone"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="40000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Create Milestone</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {milestones.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No milestones yet. Add one to track project billing stages.
          </Card>
        ) : (
          milestones.map((milestone) => (
            <Card key={milestone.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{milestone.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                      {milestone.status}
                    </span>
                    {milestone.invoiced && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Invoiced
                      </span>
                    )}
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-semibold text-lg text-gray-900">
                      ₹{milestone.amount.toLocaleString()}
                    </span>
                    {milestone.dueDate && (
                      <span>
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {milestone.completedDate && (
                      <span className="text-green-600">
                        Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {milestone.status !== "DONE" && milestone.status !== "CANCELLED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkDone(milestone.id)}
                    >
                      Mark Done
                    </Button>
                  )}
                  {milestone.status === "DONE" && !milestone.invoiced && (
                    <Button
                      size="sm"
                      onClick={() => handleCreateInvoice(milestone.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Create Invoice
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
