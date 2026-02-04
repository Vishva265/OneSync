// import { useEffect, useMemo, useState } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { salesOrdersApi } from '@/api/salesOrders'
// import { invoicesApi } from '@/api/invoices'

// export function InvoiceFromSoPage() {
//   const { soId } = useParams()
//   const navigate = useNavigate()
//   const { data: soRes } = useQuery({ queryKey: ['so', soId], queryFn: async () => (soId ? (await salesOrdersApi.getById(soId)).data : null) })
//   const so = soRes?.data || soRes

//   const [taxPercent, setTaxPercent] = useState(0)
//   const [discountPercent, setDiscountPercent] = useState(0)

//   const invoiceDate = new Date().toISOString().slice(0,10)
//   const invoiceNumber = `INV-${Date.now()}`

//   const lines = so?.lines || []
//   const subtotal = useMemo(() => lines.reduce((s:any,l:any)=> s + (Number(l.amount) || 0), 0), [lines])
//   const tax = subtotal * (taxPercent/100)
//   const discount = subtotal * (discountPercent/100)
//   const total = subtotal + tax - discount

//   const save = async () => {
//     try {
//       const payload = {
//         number: invoiceNumber,
//         projectId: so?.projectId,
//         sourceSoId: so?.id,
//         customerId: so?.customerId,
//         customerName: so?.customerName,
//         totalAmount: total,
//         currency: so?.currency || 'USD',
//         invoiceLines: lines.map((l:any)=>({ description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, amount: l.amount })),
//       }
//       const res = await invoicesApi.createFromSo(payload)
//       const invoiceId = res.data.invoice.id || res.data.id
//       alert('Invoice created')
//       navigate(`/invoice/view/${invoiceId}`)
//     } catch (err:any) {
//       alert('Failed to create invoice: '+ (err?.response?.data?.message || err.message))
//     }
//   }

//   if (!soId) return <div>Missing SO id</div>
//   if (!so) return <div>Loading SO...</div>

//   return (
//     <div className="space-y-4">
//       <h1 className="text-xl font-bold">Create Invoice from SO {so.number}</h1>
//       <div>Customer: {so.customerName}</div>
//       <div>SO Date: {new Date(so.createdAt).toLocaleDateString()}</div>
//       <div>Invoice #: {invoiceNumber}</div>
//       <div>
//         <h3 className="font-semibold">Lines</h3>
//         {lines.map((l:any)=> (
//           <div key={l.id} className="flex justify-between">
//             <div>{l.description}</div>
//             <div>{l.quantity} x ${l.unitPrice} = ${l.amount}</div>
//           </div>
//         ))}
//       </div>
//       <div>Subtotal: ${subtotal}</div>
//       <div>
//         <label>Tax %</label>
//         <input type="number" value={taxPercent} onChange={(e)=>setTaxPercent(Number(e.target.value))} />
//       </div>
//       <div>
//         <label>Discount %</label>
//         <input type="number" value={discountPercent} onChange={(e)=>setDiscountPercent(Number(e.target.value))} />
//       </div>
//       <div>Total: ${total}</div>
//       <div>
//         <button className="px-3 py-2 bg-blue-600 text-white" onClick={save}>Save Invoice</button>
//       </div>
//     </div>
//   )
// }

// export default InvoiceFromSoPage
