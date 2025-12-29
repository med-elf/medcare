import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { NewInvoiceDialog } from "@/components/billing/NewInvoiceDialog";
import { useInvoices, usePendingPayments, useVerifyPayment, useUpdateInvoiceStatus } from "@/hooks/useBilling";
import { usePatients } from "@/hooks/usePatients";
import {
  Plus,
  Search,
  Filter,
  QrCode,
  CreditCard,
  Banknote,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  Printer,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  paid: { label: "Paid", className: "bg-success/10 text-success", icon: CheckCircle },
  pending: { label: "Pending", className: "bg-warning/10 text-warning", icon: Clock },
  draft: { label: "Draft", className: "bg-secondary text-secondary-foreground", icon: Clock },
  sent: { label: "Sent", className: "bg-info/10 text-info", icon: Send },
  overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive", icon: AlertCircle },
  partial: { label: "Partial", className: "bg-info/10 text-info", icon: Clock },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground", icon: AlertCircle },
};

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("invoices");
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);

  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: pendingPayments = [], isLoading: paymentsLoading } = usePendingPayments();
  const { data: patients = [] } = usePatients();
  const verifyPayment = useVerifyPayment();
  const updateStatus = useUpdateInvoiceStatus();

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown";
  };

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.total_amount), 0);
  const pendingAmount = invoices
    .filter((i) => i.status !== "paid" && i.status !== "cancelled")
    .reduce((sum, i) => sum + Number(i.total_amount) - Number(i.paid_amount), 0);

  const filteredInvoices = invoices.filter((inv) =>
    inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getPatientName(inv.patient_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVerify = async (paymentId: string) => {
    await verifyPayment.mutateAsync(paymentId);
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    await updateStatus.mutateAsync({ id: invoiceId, status: "paid" });
  };

  return (
    <div className="min-h-screen">
      <Header title="Billing & Payments" subtitle="Manage invoices and payment verification" />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold text-success">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">${pendingAmount.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{invoices.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Verification</p>
                  <p className="text-2xl font-bold">{pendingPayments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="verification" className="relative">
                Payment Verification
                {pendingPayments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {pendingPayments.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="gap-2" onClick={() => setShowNewInvoiceDialog(true)}>
                <Plus className="w-4 h-4" />
                New Invoice
              </Button>
            </div>
          </div>

          <TabsContent value="invoices">
            <Card>
              <CardContent className="p-0">
                {invoicesLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? "No invoices found" : "No invoices yet. Create your first invoice!"}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice, index) => {
                        const status = statusConfig[invoice.status] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        return (
                          <motion.tr
                            key={invoice.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="group"
                          >
                            <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getPatientName(invoice.patient_id).split(" ").map((n) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{getPatientName(invoice.patient_id)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(invoice.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="font-semibold">
                              ${Number(invoice.total_amount).toLocaleString()}
                              {invoice.status === "partial" && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (${Number(invoice.paid_amount).toLocaleString()} paid)
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("gap-1", status.className)}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2">
                                    <Eye className="w-4 h-4" /> View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <Printer className="w-4 h-4" /> Print
                                  </DropdownMenuItem>
                                  {invoice.status !== "paid" && (
                                    <DropdownMenuItem
                                      className="gap-2 text-success"
                                      onClick={() => handleMarkAsPaid(invoice.id)}
                                    >
                                      <CheckCircle className="w-4 h-4" /> Mark as Paid
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paymentsLoading ? (
                [...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))
              ) : pendingPayments.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto text-success/50 mb-4" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-muted-foreground">No payment proofs pending verification</p>
                </div>
              ) : (
                pendingPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-32 h-32 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                            {payment.proof_url ? (
                              <img
                                src={payment.proof_url}
                                alt="Payment proof"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <QrCode className="w-12 h-12 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-mono text-sm text-muted-foreground">
                                  {payment.invoice?.invoice_number || "N/A"}
                                </p>
                                <p className="font-semibold text-lg">
                                  {payment.patient?.first_name} {payment.patient?.last_name}
                                </p>
                                <p className="text-2xl font-bold text-primary mt-2">
                                  ${Number(payment.amount).toLocaleString()}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {format(new Date(payment.payment_date), "MMM d, h:mm a")}
                              </Badge>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <Button
                                className="flex-1 gap-2 bg-success hover:bg-success/90"
                                onClick={() => handleVerify(payment.id)}
                                disabled={verifyPayment.isPending}
                              >
                                {verifyPayment.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Verify & Accept
                              </Button>
                              <Button variant="outline" className="flex-1 gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewInvoiceDialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog} />
    </div>
  );
}
