// src/pages/ProjectCreatePage.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/api/projects"
import { usersApi } from "@/api/users"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type UserLite = { id: string; fullName?: string; email?: string; role?: string }
type Status = "ACTIVE" | "DRAFT"

export default function ProjectCreatePage() {
  const navigate = useNavigate()

  // Load users (for Manager dropdown)
  const { data: users = [], isLoading: loadingUsers, isError: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await usersApi.getAll()).data,
  })

  // ---- Form state
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [budgetAmount, setBudgetAmount] = useState<number | "">("")
  const [currency, setCurrency] = useState("USD")
  const [status, setStatus] = useState<Status>("ACTIVE")
  const [startDate, setStartDate] = useState<string>("")
  const [dueDate, setDueDate] = useState<string>("")
  const [managerId, setManagerId] = useState<string>("") // NEW: manager

  // basic client validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Managers list: show PROJECT_MANAGERs (and optionally ADMINs as fallback)
  const managerOptions: UserLite[] = useMemo(() => {
    const list = (users as UserLite[]) || []
    return list.filter(u => {
      const r = (u.role || "").toUpperCase()
      return r === "PROJECT_MANAGER" || r === "ADMIN"
    })
  }, [users])

  // ---- Validation
  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Project name is required"
    if (!managerId) e.managerId = "Please select a manager"
    if (budgetAmount !== "" && Number(budgetAmount) < 0) e.budgetAmount = "Budget must be ≥ 0"
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      e.dates = "Due date cannot be earlier than start date"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ---- Create mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error("Please fix the errors and try again.")

      const payload: any = {
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        budgetAmount: budgetAmount === "" ? undefined : Number(budgetAmount),
        currency,
        status,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        managerId: managerId || undefined, // NEW: managerId in payload
      }

      const res = await projectsApi.create(payload)
      return res.data
    },
    onSuccess: (project) => {
      navigate(`/projects/${project.id}`)
    },
  })

  // optional: warn if trying to leave with dirty form (simple heuristic)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const dirty =
        name || code || description || budgetAmount !== "" || startDate || dueDate || managerId
      if (!createMutation.isSuccess && dirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [name, code, description, budgetAmount, startDate, dueDate, managerId, createMutation.isSuccess])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate()
  }

  const inputBase =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  const errorText = "text-xs text-red-600 mt-1"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Project</h1>
          <Button variant="outline" className="border-gray-300 rounded-lg" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>

        {usersError && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
            Couldn’t load users. Manager selection might be incomplete.
          </div>
        )}

        <Card className="rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name *</label>
                  <input
                    className={`${inputBase} ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="Website Redesign"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && <p className={errorText}>{errors.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Code</label>
                  <input
                    className={inputBase}
                    placeholder="PRJ-2025-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className={inputBase}
                  rows={3}
                  placeholder="Brief description of scope and objectives…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Manager selector (replaces Team Members) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-sm font-medium text-gray-700">Manager *</label>
                  <select
                    className={`${inputBase} ${errors.managerId ? "border-red-500 focus:ring-red-500" : ""}`}
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                  >
                    <option value="" disabled>
                      {loadingUsers ? "Loading managers…" : "Select a manager"}
                    </option>
                    {managerOptions.map((u) => (
                      <option key={u.id} value={u.id}>
                        {(u.fullName || u.email) + (u.role ? ` (${u.role})` : "")}
                      </option>
                    ))}
                  </select>
                  {errors.managerId && <p className={errorText}>{errors.managerId}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Budget</label>
                  <input
                    type="number"
                    min={0}
                    className={`${inputBase} ${errors.budgetAmount ? "border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="100000"
                    value={budgetAmount}
                    onChange={(e) =>
                      setBudgetAmount(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                  {errors.budgetAmount && <p className={errorText}>{errors.budgetAmount}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Currency</label>
                  <select className={inputBase} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    className={inputBase}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      className={inputBase}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      className={`${inputBase} ${errors.dates ? "border-red-500 focus:ring-red-500" : ""}`}
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                    {errors.dates && <p className={errorText}>{errors.dates}</p>}
                  </div>
                </div>
              </div>

              {createMutation.isError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
                  {(createMutation.error as any)?.message || "Failed to create project"}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 rounded-lg"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {createMutation.isPending ? "Creating…" : "Create Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
