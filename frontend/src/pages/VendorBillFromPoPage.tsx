"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { purchaseOrdersApi } from "@/api/purchaseOrders"
import { vendorBillsApi } from "@/api/vendorBills"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VendorBillFromPoPage() {
  const { poId } = useParams<{ poId: string }>()
  const navigate = useNavigate()
  const { data: po } = useQuery({ queryKey: ["po", poId], queryFn: () => purchaseOrdersApi.getById(poId!).then(r => r.data) })

  const createMut = useMutation({ mutationFn: (payload: any) => vendorBillsApi.createFromPo(poId!, payload), onSuccess: (res: any) => { navigate(`/vendor-bill/view/${res.data.vendorBill.id}`) } })

  if (!po) return <div>Loading PO...</div>

  const handleCreate = () => {
    const payload = { number: `BILL-${Date.now()}`, notes: `Bill for PO ${po.number}` }
    createMut.mutate(payload)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Create Vendor Bill from PO {po.number}</h2>

      <Card>
        <CardHeader>
          <CardTitle>PO Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Vendor: {po.vendorName}</div>
          <div>Total: ${po.totalAmount}</div>
          <div className="mt-4">
            <Button onClick={handleCreate}>Create Vendor Bill</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
