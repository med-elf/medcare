import { useState } from "react";
import { useCreatePayment } from "@/hooks/useBilling";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, DollarSign } from "lucide-react";
import { PaymentMethod } from "@/types/database";

interface RecordPaymentDialogProps {
  invoiceId: string;
  patientId: string;
  balanceDue: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "esewa", label: "eSewa" },
  { value: "khalti", label: "Khalti" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

export function RecordPaymentDialog({
  invoiceId,
  patientId,
  balanceDue,
  open,
  onOpenChange,
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState(balanceDue.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const createPayment = useCreatePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createPayment.mutateAsync({
      invoice_id: invoiceId,
      patient_id: patientId,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      reference_number: referenceNumber || null,
      notes: notes || null,
      payment_date: new Date().toISOString(),
      is_verified: true,
      proof_url: null,
      verified_at: new Date().toISOString(),
      verified_by: null,
    });

    onOpenChange(false);
    setAmount(balanceDue.toString());
    setPaymentMethod("cash");
    setReferenceNumber("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for this invoice. Balance due: ${balanceDue.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={balanceDue}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(balanceDue.toString())}
              >
                Full Amount
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount((balanceDue / 2).toFixed(2))}
              >
                50%
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input
              id="reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Transaction ID, check number, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPayment.isPending}>
              {createPayment.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4 mr-2" />
              )}
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}