// import { useMemo, useState } from "react"
// import { useNavigate } from 'react-router-dom'
// import { useQuery } from "@tanstack/react-query"
// import { invoicesApi } from "@/api/invoices"
// import { projectsApi } from "@/api/projects"
// import { tasksApi } from "@/api/tasks"
// import { salesOrdersApi } from "@/api/salesOrders"
// import type { CustomerInvoice, Project, Task } from "@/types"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// export function FinancePage() {
//   const [filters, setFilters] = useState<{ project?: string; status?: CustomerInvoice["status"] | "" }>({})
//   const { data: invoices = [], isLoading } = useQuery({
//     queryKey: ["invoices", filters],
//     queryFn: async () => (await invoicesApi.getAll(filters.project)).data,
//   })

//   // Projects for SO creation
//   const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: async () => (await projectsApi.getAll()).data })

//   const [creating, setCreating] = useState(false)
//   const [soProjectId, setSoProjectId] = useState<string | undefined>(undefined)
//   const [_soUnitPrice, _setSoUnitPrice] = useState<number | undefined>(undefined)
//   const [_soQuantity, _setSoQuantity] = useState<number>(1)
//   const [_soDescription, _setSoDescription] = useState<string>("")
//   // multi-line support
//   const [soLines, setSoLines] = useState<Array<any>>([{ productName: '', quantity: 1, unitPrice: undefined }])

//   const addSoLine = () => setSoLines(s => [...s, { productName: '', quantity: 1, unitPrice: undefined }])
//   const removeSoLine = (i: number) => setSoLines(s => s.filter((_, idx) => idx !== i))
//   const updateSoLine = (i: number, k: string, v: any) => setSoLines(s => s.map((ln, idx) => idx === i ? { ...ln, [k]: v } : ln))

//   const selectedProject: Project | undefined = projects.find((p: any) => p.id === soProjectId)

//   const { data: projectTasks = [] } = useQuery({
//     queryKey: ["project-tasks", soProjectId],
//     queryFn: async () => (soProjectId ? (await tasksApi.getByProject(soProjectId)).data : []),
//     enabled: !!soProjectId,
//   })

//   // Sales Orders list
//   const {
//     data: salesOrders = [],
//     isLoading: salesOrdersLoading,
//     refetch: refetchSalesOrders,
//   } = useQuery({
//     queryKey: ["sales-orders", filters.project],
//     queryFn: async () => (await salesOrdersApi.getAll(filters.project)).data,
//   })
  
//   const navigate = useNavigate()
//   const goToInvoiceFromSo = (soId: string) => {
//     navigate(`/invoice/${soId}`)
//   }

//   // Estimate: prefer project budget, else estimate from tasks (sum hours * default rate 50)
//   const estimatedAmount = useMemo(() => {
//     if (!selectedProject) return 0
//     if (selectedProject.budgetAmount) return selectedProject.budgetAmount
//     const totalHours = (projectTasks as Task[]).reduce((s, t) => s + (t.estimateHours || 0), 0)
//     const rate = (selectedProject.projectManager?.defaultHourlyRate as number) || 50
//     return Math.round(totalHours * rate)
//   }, [selectedProject, projectTasks])

//   // removed unused total line amount helper

//   const filtered = invoices.filter((inv) => (filters.status ? inv.status === filters.status : true))

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Customer Invoices</h1>
//           <p className="text-gray-600 text-sm">Track revenue generated from projects</p>
//         </div>
//         <div className="flex gap-2">
//           <input
//             placeholder="Filter by project ID"
//             className="px-3 py-2 border rounded"
//             value={filters.project || ""}
//             onChange={(e) => setFilters((f) => ({ ...f, project: e.target.value || undefined }))}
//           />
//           <select
//             className="px-3 py-2 border rounded"
//             value={filters.status || ""}
//             onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value as any) || undefined }))}
//           >
//             <option value="">All Status</option>
//             <option value="DRAFT">Draft</option>
//             <option value="SUBMITTED">Submitted</option>
//             <option value="POSTED">Posted</option>
//             <option value="PAID">Paid</option>
//             <option value="CANCELLED">Cancelled</option>
//           </select>
//           <button
//             className="px-3 py-2 bg-green-600 text-white rounded"
//             onClick={() => {
//               // open creation panel
//               setCreating((c) => !c)
//             }}
//           >
//             {creating ? "Close SO Creator" : "Create Sales Order"}
//           </button>
//         </div>
//       </div>

//       {creating && (
//         <div className="p-4 border rounded bg-white">
//           <h2 className="text-lg font-semibold mb-2">Create Sales Order (SO)</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
//             <select className="border px-2 py-2" value={soProjectId || ""} onChange={(e) => setSoProjectId(e.target.value || undefined)}>
//               <option value="">Select Project</option>
//               {projects.map((p: Project) => (
//                 <option key={p.id} value={p.id}>
//                   {p.code} - {p.name}
//                 </option>
//               ))}
//             </select>
//             <div className="md:col-span-2">
//               <div className="space-y-2">
//                 {soLines.map((ln, idx) => (
//                   <div key={idx} className="flex gap-2">
//                     <input placeholder="Product name" value={ln.productName} onChange={(e) => updateSoLine(idx, 'productName', e.target.value)} className="flex-1 border px-2 py-2" />
//                     <input placeholder="Qty" type="number" value={ln.quantity} onChange={(e) => updateSoLine(idx, 'quantity', Number(e.target.value))} className="w-20 border px-2 py-2" />
//                     <input placeholder="Price" type="number" value={ln.unitPrice ?? ''} onChange={(e) => updateSoLine(idx, 'unitPrice', e.target.value ? Number(e.target.value) : undefined)} className="w-32 border px-2 py-2" />
//                     <button className="px-2" onClick={() => removeSoLine(idx)}>Remove</button>
//                   </div>
//                 ))}
//                 <div>
//                   <button className="px-3 py-1 border rounded" onClick={addSoLine}>Add Line</button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center mb-3">
//             <div className="text-sm text-gray-600">Estimated amount: ${estimatedAmount}</div>
//             <div className="text-right font-semibold">Order total: ${soLines.reduce((s, ln) => s + ((ln.quantity || 0) * (ln.unitPrice || 0)), 0)}</div>
//           </div>

//           <div className="flex gap-2">
//             <button
//               className="px-4 py-2 bg-blue-600 text-white rounded"
//               onClick={async () => {
//                 if (!soProjectId) return alert('Please select a project')
//                 const proj = selectedProject as Project
//                 const soNumber = `SO-${Date.now()}`
//                   const computedLines = soLines.map(ln => ({ productName: ln.productName || ln.description || `Line`, quantity: Number(ln.quantity || 0), unitPrice: Number(ln.unitPrice || 0) }))
//                   const orderTotal = computedLines.reduce((s, ln) => s + (ln.quantity * ln.unitPrice), 0)
//                   const payload = {
//                     number: soNumber,
//                     projectId: soProjectId,
//                     customerId: (proj as any).customerId,
//                     customerName: proj.name,
//                     currency: proj.currency || 'USD',
//                     totalAmount: orderTotal,
//                     lines: computedLines,
//                   }

//                 try {
//                   await salesOrdersApi.create(payload)
//                   alert('Sales Order created successfully')
//                   // refresh sales orders list so the new SO appears on the page
//                   try {
//                     await refetchSalesOrders()
//                   } catch (e) {
//                     /* ignore refetch error */
//                   }
//                   // reset
//                   setSoProjectId(undefined)
//                   _setSoDescription('')
//                   _setSoQuantity(1)
//                   _setSoUnitPrice(undefined)
//                   setCreating(false)
//                 } catch (err: any) {
//                   alert('Failed to create SO: ' + (err?.response?.data?.message || err.message))
//                 }
//               }}
//             >
//               Create SO
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Sales Orders list */}
//       <div className="mt-6">
//         <h2 className="text-xl font-semibold mb-3">Sales Orders</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {salesOrdersLoading && <div>Loading sales orders...</div>}
//           {!salesOrdersLoading &&
//             (salesOrders as any[]).map((so) => (
//               <Card key={so.id}>
//                   <CardHeader>
//                     <CardTitle className="text-sm flex items-center justify-between">
//                       <span>{so.number}</span>
//                       <span className="text-xs px-2 py-1 rounded bg-gray-100">{so.status}</span>
//                     </CardTitle>
//                   </CardHeader>
//                 <CardContent>
//                   <div className="flex items-center justify-between">
//                     <div className="text-sm text-gray-600">{so.project ? `Project: ${so.project.name || so.projectId}` : (so.projectId ? `Project: ${so.projectId}` : "No project")}</div>
//                     <div className="text-lg font-semibold">${so.totalAmount}</div>
//                   </div>
//                   {so.createdAt && <div className="text-xs text-gray-500 mt-2">{new Date(so.createdAt).toLocaleDateString()}</div>}
//                   <div className="mt-3 flex gap-2">
//                     <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => goToInvoiceFromSo(so.id)}>Create Invoice</button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {isLoading && <div>Loading...</div>}
//         {!isLoading &&
//           filtered.map((inv) => (
//             <Card key={inv.id}>
//               <CardHeader>
//                 <CardTitle className="text-sm flex items-center justify-between">
//                   <span>{inv.number}</span>
//                   <span className="text-xs px-2 py-1 rounded bg-gray-100">{inv.status}</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex items-center justify-between">
//                   <div className="text-sm text-gray-600">{new Date(inv.createdAt).toLocaleDateString()}</div>
//                   <div className="text-lg font-semibold">${inv.totalAmount}</div>
//                 </div>
//                 {inv.projectId && <div className="text-xs text-gray-500 mt-2">Project: {inv.projectId}</div>}
//               </CardContent>
//             </Card>
//           ))}
//       </div>
//     </div>
//   )
// }
