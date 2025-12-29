import { useForm } from "react-hook-form";
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
import { useInventoryCategories, useCreateInventoryItem } from "@/hooks/useInventory";
import { Loader2 } from "lucide-react";

const inventorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  category_id: z.string().optional(),
  quantity: z.number().min(0).default(0),
  min_quantity: z.number().min(0).default(10),
  unit: z.string().optional(),
  unit_cost: z.number().min(0).optional(),
  selling_price: z.number().min(0).optional(),
  expiry_date: z.string().optional(),
  location: z.string().optional(),
  supplier_name: z.string().optional(),
  supplier_contact: z.string().optional(),
  description: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface AddInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddInventoryItemDialog({ open, onOpenChange }: AddInventoryItemDialogProps) {
  const { data: categories = [] } = useInventoryCategories();
  const createItem = useCreateInventoryItem();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      quantity: 0,
      min_quantity: 10,
      unit: "pcs",
    },
  });

  const onSubmit = async (data: InventoryFormData) => {
    await createItem.mutateAsync({
      name: data.name,
      sku: data.sku || null,
      category_id: data.category_id || null,
      quantity: data.quantity,
      min_quantity: data.min_quantity,
      unit: data.unit || "pcs",
      unit_cost: data.unit_cost || null,
      selling_price: data.selling_price || null,
      expiry_date: data.expiry_date || null,
      location: data.location || null,
      supplier_name: data.supplier_name || null,
      supplier_contact: data.supplier_contact || null,
      description: data.description || null,
      is_active: true,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue("category_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Current Quantity</Label>
              <Input id="quantity" type="number" {...register("quantity", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_quantity">Reorder Level</Label>
              <Input id="min_quantity" type="number" {...register("min_quantity", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select defaultValue="pcs" onValueChange={(v) => setValue("unit", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">Pieces</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                  <SelectItem value="bottle">Bottle</SelectItem>
                  <SelectItem value="ml">mL</SelectItem>
                  <SelectItem value="g">Grams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_cost">Unit Cost</Label>
              <Input id="unit_cost" type="number" step="0.01" {...register("unit_cost", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price</Label>
              <Input id="selling_price" type="number" step="0.01" {...register("selling_price", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input id="expiry_date" type="date" {...register("expiry_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input id="location" placeholder="e.g., Shelf A-3" {...register("location")} />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Supplier Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_name">Supplier Name</Label>
                <Input id="supplier_name" {...register("supplier_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier_contact">Supplier Contact</Label>
                <Input id="supplier_contact" {...register("supplier_contact")} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createItem.isPending}>
              {createItem.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
