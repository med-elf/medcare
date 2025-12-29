import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePatients } from "@/hooks/usePatients";
import { useCreateInvoice } from "@/hooks/useBilling";
import { Loader2, Plus, Trash2 } from "lucide-react";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.number().min(1),
  unit_price: z.number().min(0),
});

const invoiceSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewInvoiceDialog({ open, onOpenChange }: NewInvoiceDialogProps) {
  const { data: patients = [] } = usePatients();
  const createInvoice = useCreateInvoice();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [{ description: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const onSubmit = async (data: InvoiceFormData) => {
    await createInvoice.mutateAsync({
      invoice: {
        patient_id: data.patient_id,
        due_date: data.due_date || null,
        notes: data.notes || null,
        invoice_number: '',
        status: 'draft',
        subtotal: subtotal,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: subtotal,
        paid_amount: 0,
      },
      items: data.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      })),
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a patient.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select onValueChange={(v) => setValue("patient_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patient_id && (
                <p className="text-sm text-destructive">{errors.patient_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" {...register("due_date")} />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Invoice Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", quantity: 1, unit_price: 0 })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-start p-3 rounded-lg bg-secondary/30">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Service description"
                      {...register(`items.${index}.description`)}
                    />
                  </div>
                  <div className="w-20 space-y-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="w-28 space-y-2">
                    <Input
                      type="number"
                      placeholder="Price"
                      min={0}
                      step="0.01"
                      {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="w-28 pt-2 text-right font-medium">
                    ${((items[index]?.quantity || 0) * (items[index]?.unit_price || 0)).toFixed(2)}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.items && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createInvoice.isPending}>
              {createInvoice.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
