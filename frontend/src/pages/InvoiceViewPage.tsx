import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { invoicesApi } from '@/api/invoices'

export function InvoiceViewPage(){
  const { invoiceId } = useParams()
  const { data } = useQuery({ queryKey: ['invoice', invoiceId], queryFn: async () => invoiceId ? (await invoicesApi.getById(invoiceId)).data : null })
  const inv = data
  if (!inv) return <div>Loading invoice...</div>
  return (
    <div>
      <h1 className="text-xl font-bold">Invoice {inv.number}</h1>
    <div>Project: {inv.projectId || 'N/A'}</div>
      <div>Total: ${inv.totalAmount}</div>
      <div>
        <h3 className="font-semibold">Lines</h3>
        {inv.invoiceLines?.map((l:any)=> (
          <div key={l.id} className="flex justify-between">
            <div>{l.description}</div>
            <div>{l.quantity} x ${l.unitPrice} = ${l.amount}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InvoiceViewPage
