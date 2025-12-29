import { useRef } from "react";
import { motion } from "framer-motion";
import { useInvoice } from "@/hooks/useBilling";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, Download, X, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InvoiceViewDialogProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  paid: { label: "Paid", className: "bg-success/10 text-success", icon: CheckCircle },
  pending: { label: "Pending", className: "bg-warning/10 text-warning", icon: Clock },
  draft: { label: "Draft", className: "bg-secondary text-secondary-foreground", icon: Clock },
  sent: { label: "Sent", className: "bg-info/10 text-info", icon: Clock },
  overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive", icon: AlertCircle },
  partial: { label: "Partial", className: "bg-info/10 text-info", icon: Clock },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground", icon: AlertCircle },
};

export function InvoiceViewDialog({ invoiceId, open, onOpenChange }: InvoiceViewDialogProps) {
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice?.invoice_number}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background: #f9fafb; font-weight: 600; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .invoice-number { font-size: 24px; font-weight: bold; }
            .totals { text-align: right; margin-top: 20px; }
            .total-row { display: flex; justify-content: flex-end; gap: 40px; padding: 8px 0; }
            .grand-total { font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const status = invoice ? statusConfig[invoice.status] || statusConfig.pending : statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice Details</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !invoice ? (
          <div className="text-center py-8 text-muted-foreground">
            Invoice not found
          </div>
        ) : (
          <div ref={printRef} className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{invoice.invoice_number}</h2>
                <p className="text-muted-foreground">
                  Created on {format(new Date(invoice.created_at), "MMMM d, yyyy")}
                </p>
                {invoice.due_date && (
                  <p className="text-sm text-muted-foreground">
                    Due: {format(new Date(invoice.due_date), "MMMM d, yyyy")}
                  </p>
                )}
              </div>
              <Badge className={cn("gap-1", status.className)}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
            </div>

            <Separator />

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Bill To</h3>
                <p className="font-medium">
                  {invoice.patient?.first_name} {invoice.patient?.last_name}
                </p>
                {invoice.patient?.email && (
                  <p className="text-sm text-muted-foreground">{invoice.patient.email}</p>
                )}
                {invoice.patient?.phone && (
                  <p className="text-sm text-muted-foreground">{invoice.patient.phone}</p>
                )}
                {invoice.patient?.address && (
                  <p className="text-sm text-muted-foreground">{invoice.patient.address}</p>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${Number(item.unit_price).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(item.total_price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(invoice.subtotal).toFixed(2)}</span>
                </div>
                {Number(invoice.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-destructive">-${Number(invoice.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                {Number(invoice.tax_amount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${Number(invoice.tax_amount).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${Number(invoice.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-success">
                  <span>Paid</span>
                  <span>${Number(invoice.paid_amount).toFixed(2)}</span>
                </div>
                {Number(invoice.total_amount) - Number(invoice.paid_amount) > 0 && (
                  <div className="flex justify-between font-semibold text-warning">
                    <span>Balance Due</span>
                    <span>${(Number(invoice.total_amount) - Number(invoice.paid_amount)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Payment History</h3>
                <div className="space-y-2">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          ${Number(payment.amount).toFixed(2)} via {payment.payment_method.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.payment_date), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                      <Badge variant={payment.is_verified ? "default" : "secondary"}>
                        {payment.is_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}