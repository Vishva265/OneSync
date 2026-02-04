"use client"

import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { vendorBillsApi } from "@/api/vendorBills"

export default function VendorBillViewPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const { data: bill } = useQuery({ queryKey: ["vendor-bill", invoiceId], queryFn: () => vendorBillsApi.getById(invoiceId!).then(r => r.data) })

  if (!bill) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vendor Bill {bill.number}</h2>
      <div>Vendor: {bill.vendorName}</div>
      <div>Total: ${bill.totalAmount}</div>
      <div className="mt-4">
        <h3 className="font-semibold">Lines</h3>
        <ul>
          {bill.billLines.map((l: any) => (
            <li key={l.id}>{l.description} - {l.quantity} x ${l.unitPrice} = ${l.amount}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
