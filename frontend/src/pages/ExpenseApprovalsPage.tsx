import { useState, useEffect } from "react"
import { expensesApi } from "@/api/expenses"
import { projectsApi } from "@/api/projects"
import type { Expense, Project } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ExpenseApprovalsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [rejectReason, setRejectReason] = useState<string>("")
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
    fetchPendingExpenses()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const fetchPendingExpenses = async (projectId?: string) => {
    setLoading(true)
    try {
      const response = await expensesApi.getPending(projectId)
      setExpenses(response.data)
    } catch (error) {
      console.error("Failed to fetch pending expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectFilter = (projectId: string) => {
    setSelectedProject(projectId)
    fetchPendingExpenses(projectId || undefined)
  }

  const handleApprove = async (expenseId: string) => {
    try {
      await expensesApi.approve(expenseId)
      alert("Expense approved successfully!")
      fetchPendingExpenses(selectedProject || undefined)
    } catch (error) {
      console.error("Failed to approve expense:", error)
      alert("Failed to approve expense")
    }
  }

  const handleReject = async (expenseId: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }
    try {
      await expensesApi.reject(expenseId, rejectReason)
      alert("Expense rejected")
      setRejectingId(null)
      setRejectReason("")
      fetchPendingExpenses(selectedProject || undefined)
    } catch (error) {
      console.error("Failed to reject expense:", error)
      alert("Failed to reject expense")
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-800",
      SUBMITTED: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || colors.DRAFT
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Expense Approvals</h1>
        <p className="text-gray-600">Review and approve team member expenses</p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="font-medium">Filter by Project:</label>
          <select
            value={selectedProject}
            onChange={(e) => handleProjectFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pending Approval</div>
          <div className="text-2xl font-bold">{expenses.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-2xl font-bold">
            ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Billable Expenses</div>
          <div className="text-2xl font-bold">
            {expenses.filter((exp) => exp.billable).length}
          </div>
        </Card>
      </div>

      {/* Expense List */}
      {loading ? (
        <div className="text-center py-12">Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 text-lg">No pending expenses to review</div>
          <p className="text-gray-500 text-sm mt-2">
            All expenses have been processed
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{expense.category}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(expense.status)}`}>
                      {expense.status}
                    </span>
                    {expense.billable && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Billable
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600">Amount</div>
                      <div className="text-xl font-bold text-gray-900">
                        ₹{expense.amount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Date</div>
                      <div className="font-medium">
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Submitted By</div>
                      <div className="font-medium">{expense.user?.fullName || "Unknown"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Project</div>
                      <div className="font-medium">{expense.project?.name || "N/A"}</div>
                    </div>
                  </div>

                  {expense.notes && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600">Notes</div>
                      <div className="text-gray-800">{expense.notes}</div>
                    </div>
                  )}

                  {expense.receiptUrl && (
                    <div className="mb-3">
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        📎 View Receipt
                      </a>
                    </div>
                  )}

                  {rejectingId === expense.id && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md mb-2"
                        rows={2}
                        placeholder="Explain why this expense is being rejected..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReject(expense.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Confirm Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectingId(null)
                            setRejectReason("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {expense.status === "SUBMITTED" && rejectingId !== expense.id && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(expense.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setRejectingId(expense.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
