import { useState, useEffect } from "react"
import { expensesApi } from "@/api/expenses"
import { projectsApi } from "@/api/projects"
import type { Expense, Project } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth"

export default function ExpensesPage() {
  const { user } = useAuthStore()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    projectId: "",
    amount: 0,
    currency: "INR",
    date: new Date().toISOString().split("T")[0],
    category: "",
    billable: false,
    notes: "",
    receiptUrl: "",
  })

  useEffect(() => {
    fetchProjects()
    fetchExpenses()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const response = await expensesApi.getAll()
      setExpenses(response.data)
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("User not logged in")
      return
    }
    try {
      await expensesApi.create({
        ...formData,
        userId: user.id,
      })
      alert("Expense submitted successfully!")
      setShowForm(false)
      setFormData({
        projectId: "",
        amount: 0,
        currency: "INR",
        date: new Date().toISOString().split("T")[0],
        category: "",
        billable: false,
        notes: "",
        receiptUrl: "",
      })
      fetchExpenses()
    } catch (error) {
      console.error("Failed to create expense:", error)
      alert("Failed to submit expense")
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
        <h1 className="text-3xl font-bold mb-2">My Expenses</h1>
        <p className="text-gray-600">Submit and track your project expenses</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Expenses</div>
            <div className="text-2xl font-bold">{expenses.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Pending Approval</div>
            <div className="text-2xl font-bold text-yellow-600">
              {expenses.filter((e) => e.status === "SUBMITTED").length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-bold text-green-600">
              {expenses.filter((e) => e.status === "APPROVED").length}
            </div>
          </Card>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Submit Expense"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-4">Submit New Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project *</label>
                <select
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="Travel">Travel</option>
                  <option value="Meals">Meals</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Software">Software</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Receipt URL (optional)</label>
              <input
                type="url"
                value={formData.receiptUrl}
                onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="https://storage.example.com/receipt.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Describe the expense purpose..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="billable"
                checked={formData.billable}
                onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="billable" className="text-sm">
                This expense is billable to the customer
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Submit Expense</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">Loading expenses...</div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{expense.category}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(expense.status)}`}>
                      {expense.status}
                    </span>
                    {expense.billable && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Billable
                      </span>
                    )}
                    {expense.reimbursed && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Reimbursed
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Amount</div>
                      <div className="font-semibold text-lg">
                        {expense.currency} {expense.amount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Date</div>
                      <div>{new Date(expense.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Project</div>
                      <div>{expense.project?.name || "N/A"}</div>
                    </div>
                  </div>
                  {expense.notes && (
                    <div className="mt-2 text-sm text-gray-600">{expense.notes}</div>
                  )}
                  {expense.receiptUrl && (
                    <div className="mt-2">
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
