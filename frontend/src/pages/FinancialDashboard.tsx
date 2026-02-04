import { useState, useEffect } from "react"
import { projectsApi } from "@/api/projects"
import type { Project, ProjectFinancials } from "@/types"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from "react-router-dom"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  FileText,
  Clock,
  Receipt,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight
} from "lucide-react"

export default function FinancialDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [financials, setFinancials] = useState<ProjectFinancials | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchFinancials(selectedProject)
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      setProjects(response.data)
      if (response.data.length > 0) {
        setSelectedProject(response.data[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const fetchFinancials = async (projectId: string) => {
    setLoading(true)
    try {
      const response = await projectsApi.getFinancials(projectId)
      setFinancials(response.data)
    } catch (error) {
      console.error("Failed to fetch financials:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject)

  const MetricCard = ({ title, value, subtitle, color = "blue", icon: Icon, trend }: any) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200",
      red: "bg-red-50 text-red-700 border-red-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
    }

    return (
      <Card className={`p-6 border-2 ${colorClasses[color as keyof typeof colorClasses]} transition-all hover:shadow-lg`}>
        <div className="flex items-start justify-between mb-3">
          <div className="text-sm font-medium opacity-80">{title}</div>
          {Icon && <Icon className="w-5 h-5 opacity-60" />}
        </div>
        <div className="text-3xl font-bold mb-1">
          ${value.toLocaleString()}
        </div>
        {subtitle && (
          <div className="text-xs opacity-70 flex items-center gap-1">
            {trend && (trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
            {subtitle}
          </div>
        )}
      </Card>
    )
  }

  const StatCard = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-all">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Financial Dashboard</h2>
          <p className="text-sm text-gray-500">Project financial analytics</p>
        </div>

        {/* Project Selection */}
        <div className="p-6 border-b border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Project
          </label>
          <div className="space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedProject === project.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-semibold text-sm text-gray-900">{project.code}</div>
                <div className="text-xs text-gray-600 mt-1">{project.name}</div>
                {project.type && (
                  <div className="text-xs text-gray-500 mt-1 capitalize">
                    {project.type.toLowerCase().replace('_', ' ')}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        {financials && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Overview</h3>
            
            <StatCard 
              label="Invoices" 
              value={financials.counts.invoices} 
              icon={FileText}
            />
            <StatCard 
              label="Timesheets" 
              value={financials.counts.timesheets} 
              icon={Clock}
            />
            <StatCard 
              label="Expenses" 
              value={financials.counts.expenses} 
              icon={Receipt}
            />
            <StatCard 
              label="Vendor Bills" 
              value={financials.counts.vendorBills} 
              icon={ShoppingCart}
            />

            {selectedProject && (
              <Link 
                to={`/projects/${selectedProject}`}
                className="flex items-center justify-center gap-2 w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                View Project Details
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading financial data...</p>
          </div>
        </div>
      ) : !financials ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Select a project to view financials</p>
          </div>
        </div>
      ) : (
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedProjectData?.name || 'Financial Overview'}
              </h1>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Budget Health:</span>
                {financials.budgetUsed > 90 ? (
                  <span className="flex items-center gap-1 text-red-600 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Critical
                  </span>
                ) : financials.budgetUsed > 75 ? (
                  <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Warning
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Healthy
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-500">{selectedProjectData?.code}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Revenue"
              value={financials.revenue}
              subtitle={`From ${financials.counts.invoices} invoices`}
              color="blue"
              icon={DollarSign}
            />
            <MetricCard
              title="Total Cost"
              value={financials.cost}
              subtitle="All expenses included"
              color="red"
              icon={Receipt}
            />
            <MetricCard
              title="Net Profit"
              value={financials.profit}
              subtitle={`${financials.profitMargin.toFixed(1)}% margin`}
              color="green"
              icon={TrendingUp}
              trend={financials.profit > 0 ? 1 : -1}
            />
            <MetricCard
              title="Sales Orders"
              value={financials.salesOrderTotal}
              subtitle={`${financials.counts.salesOrders} orders`}
              color="purple"
              icon={Target}
            />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white border border-gray-200 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="costs" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Cost Breakdown
              </TabsTrigger>
              <TabsTrigger value="milestones" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Milestones
              </TabsTrigger>
              <TabsTrigger value="budget" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Budget Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Revenue vs Cost Visualization */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  Revenue vs Cost Analysis
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="font-semibold text-gray-700">Revenue</span>
                      <span className="font-bold text-blue-700 text-lg">
                        ${financials.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-6 shadow-inner">
                      <div
                        className="h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-md flex items-center justify-end pr-3"
                        style={{ width: "100%" }}
                      >
                        <span className="text-white text-xs font-bold">100%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="font-semibold text-gray-700">Cost</span>
                      <span className="font-bold text-red-700 text-lg">
                        ${financials.cost.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-6 shadow-inner">
                      <div
                        className="h-6 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-md flex items-center justify-end pr-3"
                        style={{
                          width: `${financials.revenue > 0 ? Math.min(100, (financials.cost / financials.revenue) * 100) : 0}%`,
                        }}
                      >
                        <span className="text-white text-xs font-bold">
                          {financials.revenue > 0 ? ((financials.cost / financials.revenue) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="font-semibold text-gray-700">Profit</span>
                      <span className={`font-bold text-lg ${financials.profit > 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ${financials.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-6 shadow-inner">
                      <div
                        className={`h-6 rounded-full shadow-md flex items-center justify-end pr-3 ${
                          financials.profit > 0 
                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{
                          width: `${financials.revenue > 0 ? Math.max(5, (financials.profit / financials.revenue) * 100) : 5}%`,
                        }}
                      >
                        <span className="text-white text-xs font-bold">
                          {financials.profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-4 text-center hover:shadow-lg transition-all border-2 border-blue-100">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Invoices</div>
                  <div className="text-2xl font-bold text-gray-900">{financials.counts.invoices}</div>
                </Card>
                <Card className="p-4 text-center hover:shadow-lg transition-all border-2 border-green-100">
                  <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Timesheets</div>
                  <div className="text-2xl font-bold text-gray-900">{financials.counts.timesheets}</div>
                </Card>
                <Card className="p-4 text-center hover:shadow-lg transition-all border-2 border-purple-100">
                  <Receipt className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Expenses</div>
                  <div className="text-2xl font-bold text-gray-900">{financials.counts.expenses}</div>
                </Card>
                <Card className="p-4 text-center hover:shadow-lg transition-all border-2 border-orange-100">
                  <ShoppingCart className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Vendor Bills</div>
                  <div className="text-2xl font-bold text-gray-900">{financials.counts.vendorBills}</div>
                </Card>
                <Card className="p-4 text-center hover:shadow-lg transition-all border-2 border-indigo-100">
                  <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Sales Orders</div>
                  <div className="text-2xl font-bold text-gray-900">{financials.counts.salesOrders}</div>
                </Card>
                <Card className="p-4 text-center hover:shadow-lg transition-all border-2 border-pink-100">
                  <ShoppingCart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600 mb-1">Purchase Orders</div>
                  <div className="text-2xl font-bold text-gray-900">{financials.counts.purchaseOrders}</div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Timesheet Cost"
                  value={financials.timesheetCost}
                  subtitle="Labor hours"
                  color="blue"
                  icon={Clock}
                />
                <MetricCard
                  title="Expense Cost"
                  value={financials.expenseCost}
                  subtitle="Team expenses"
                  color="purple"
                  icon={Receipt}
                />
                <MetricCard
                  title="Vendor Bills"
                  value={financials.vendorBillCost}
                  subtitle="External vendors"
                  color="orange"
                  icon={ShoppingCart}
                />
              </div>

              <Card className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-purple-600" />
                  Cost Distribution
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="font-semibold text-gray-700">Timesheet Cost</span>
                      <span className="font-bold text-blue-700">
                        ${financials.timesheetCost.toLocaleString()} (
                        {financials.cost > 0
                          ? ((financials.timesheetCost / financials.cost) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-5 shadow-inner">
                      <div
                        className="h-5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-md"
                        style={{
                          width: `${financials.cost > 0 ? (financials.timesheetCost / financials.cost) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="font-semibold text-gray-700">Expense Cost</span>
                      <span className="font-bold text-purple-700">
                        ${financials.expenseCost.toLocaleString()} (
                        {financials.cost > 0
                          ? ((financials.expenseCost / financials.cost) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-5 shadow-inner">
                      <div
                        className="h-5 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 shadow-md"
                        style={{
                          width: `${financials.cost > 0 ? (financials.expenseCost / financials.cost) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="font-semibold text-gray-700">Vendor Bills</span>
                      <span className="font-bold text-orange-700">
                        ${financials.vendorBillCost.toLocaleString()} (
                        {financials.cost > 0
                          ? ((financials.vendorBillCost / financials.cost) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-5 shadow-inner">
                      <div
                        className="h-5 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 shadow-md"
                        style={{
                          width: `${financials.cost > 0 ? (financials.vendorBillCost / financials.cost) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="milestones" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                  <div className="text-sm font-medium text-blue-700 mb-2">Total Milestones</div>
                  <div className="text-4xl font-bold text-blue-900">{financials.milestones.total}</div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </div>
                  <div className="text-4xl font-bold text-green-900">{financials.milestones.done}</div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-purple-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Invoiced
                  </div>
                  <div className="text-4xl font-bold text-purple-900">{financials.milestones.invoiced}</div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-yellow-700 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Pending
                  </div>
                  <div className="text-4xl font-bold text-yellow-900">
                    {financials.milestones.total - financials.milestones.done}
                  </div>
                </Card>
              </div>

              <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-indigo-600" />
                  Milestone Financial Summary
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="font-semibold text-gray-700">Total Milestone Value</span>
                    <span className="font-bold text-2xl text-gray-900">
                      ${financials.milestones.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg shadow-sm border-2 border-green-200">
                    <span className="font-semibold text-green-700">Invoiced Amount</span>
                    <span className="font-bold text-2xl text-green-700">
                      ${financials.milestones.invoicedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg shadow-sm border-2 border-blue-200">
                    <span className="font-semibold text-blue-700">Remaining to Invoice</span>
                    <span className="font-bold text-2xl text-blue-700">
                      $
                      {(
                        financials.milestones.totalAmount - financials.milestones.invoicedAmount
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-6 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-700">Invoicing Progress</span>
                      <span className="font-bold text-lg text-gray-900">
                        {financials.milestones.totalAmount > 0
                          ? (
                              (financials.milestones.invoicedAmount / financials.milestones.totalAmount) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-6 shadow-inner">
                      <div
                        className="h-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-md flex items-center justify-center"
                        style={{
                          width: `${financials.milestones.totalAmount > 0 ? (financials.milestones.invoicedAmount / financials.milestones.totalAmount) * 100 : 0}%`,
                        }}
                      >
                        <span className="text-white text-xs font-bold">
                          {financials.milestones.invoiced} / {financials.milestones.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Budget"
                  value={financials.budgetAmount}
                  subtitle="Total allocated"
                  color="blue"
                  icon={Target}
                />
                <MetricCard
                  title="Used"
                  value={financials.cost}
                  subtitle={`${financials.budgetUsed.toFixed(1)}% of budget`}
                  color="red"
                  icon={TrendingDown}
                />
                <MetricCard
                  title="Remaining"
                  value={financials.budgetRemaining}
                  subtitle={`${(100 - financials.budgetUsed).toFixed(1)}% left`}
                  color="green"
                  icon={DollarSign}
                />
              </div>

              <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  Budget Utilization
                </h3>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="font-semibold text-gray-700">Budget Used</span>
                      <span className="font-bold text-lg text-gray-900">
                        ${financials.cost.toLocaleString()} / $
                        {financials.budgetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-8 shadow-inner">
                      <div
                        className={`h-8 rounded-full shadow-lg flex items-center justify-center font-bold text-white text-sm ${
                          financials.budgetUsed > 90
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : financials.budgetUsed > 75
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                              : "bg-gradient-to-r from-green-500 to-green-600"
                        }`}
                        style={{ width: `${Math.min(100, financials.budgetUsed)}%` }}
                      >
                        {financials.budgetUsed.toFixed(1)}%
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      {financials.budgetUsed > 90 && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 border-2 border-red-300 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-700" />
                          <span className="text-red-700 font-semibold">Budget almost exhausted</span>
                        </div>
                      )}
                      {financials.budgetUsed > 75 && financials.budgetUsed <= 90 && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-yellow-700" />
                          <span className="text-yellow-700 font-semibold">Approaching budget limit</span>
                        </div>
                      )}
                      {financials.budgetUsed <= 75 && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border-2 border-green-300 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-700" />
                          <span className="text-green-700 font-semibold">Within budget</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t-2 border-gray-200">
                    <h4 className="font-bold text-lg mb-4 text-gray-900">Budget Health Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg shadow-sm border-2 border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Planned Revenue</div>
                        <div className="text-xl font-bold text-gray-900">
                          ${financials.salesOrderTotal.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm border-2 border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Actual Revenue</div>
                        <div className="text-xl font-bold text-gray-900">
                          ${financials.revenue.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm border-2 border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Total Costs</div>
                        <div className="text-xl font-bold text-gray-900">
                          ${financials.cost.toLocaleString()}
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg shadow-sm border-2 ${
                        financials.profit > 0 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-red-50 border-red-300'
                      }`}>
                        <div className="text-sm text-gray-600 mb-1">Expected Profit</div>
                        <div className={`text-xl font-bold ${
                          financials.profit > 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          ${financials.profit.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
      </main>
    </div>
  )
}
