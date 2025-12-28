import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { AddInventoryItemDialog } from "@/components/inventory/AddInventoryItemDialog";
import {
  useInventoryItems,
  useInventoryCategories,
  useLowStockItems,
  useExpiringItems,
  useUpdateStock,
} from "@/hooks/useInventory";
import {
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  Calendar,
  Minus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: items = [], isLoading } = useInventoryItems();
  const { data: categories = [] } = useInventoryCategories();
  const { data: lowStockItems = [] } = useLowStockItems();
  const { data: expiringItems = [] } = useExpiringItems(30);
  const updateStock = useUpdateStock();

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const handleStockUpdate = async (id: string, operation: "add" | "subtract", amount: number = 1) => {
    await updateStock.mutateAsync({ id, operation, amount });
  };

  const totalValue = items.reduce(
    (sum, item) => sum + item.quantity * (item.unit_cost || 0),
    0
  );

  return (
    <div className="min-h-screen">
      <Header title="Inventory" subtitle="Manage your clinic's stock and supplies" />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-warning">{lowStockItems.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-destructive">{expiringItems.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-success">${totalValue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="low-stock" className="relative">
                Low Stock
                {lowStockItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning text-warning-foreground text-xs flex items-center justify-center">
                    {lowStockItems.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="expiring">Expiring</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? "No items found" : "No inventory items yet. Add your first item!"}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item, index) => {
                        const stockPercent = (item.quantity / item.min_quantity) * 100;
                        const isLow = item.quantity <= item.min_quantity;
                        const daysToExpiry = item.expiry_date
                          ? differenceInDays(new Date(item.expiry_date), new Date())
                          : null;

                        return (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                {item.sku && (
                                  <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{getCategoryName(item.category_id)}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={cn("font-semibold", isLow && "text-warning")}>
                                    {item.quantity}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    / {item.min_quantity} min
                                  </span>
                                </div>
                                <Progress
                                  value={Math.min(stockPercent, 100)}
                                  className={cn(
                                    "h-1.5 w-20",
                                    isLow && "[&>div]:bg-warning"
                                  )}
                                />
                              </div>
                            </TableCell>
                            <TableCell>{item.unit || "pcs"}</TableCell>
                            <TableCell className="font-medium">
                              ${((item.quantity || 0) * (item.unit_cost || 0)).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {item.expiry_date ? (
                                <Badge
                                  variant={
                                    daysToExpiry !== null && daysToExpiry <= 30
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {format(new Date(item.expiry_date), "MMM d, yyyy")}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleStockUpdate(item.id, "subtract")}
                                  disabled={item.quantity <= 0 || updateStock.isPending}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleStockUpdate(item.id, "add")}
                                  disabled={updateStock.isPending}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
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

          <TabsContent value="low-stock">
            <Card>
              <CardContent className="p-0">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    All stock levels are healthy
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Minimum</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-warning font-semibold">{item.quantity}</TableCell>
                          <TableCell>{item.min_quantity}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {item.quantity === 0 ? "Out of Stock" : "Low Stock"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expiring">
            <Card>
              <CardContent className="p-0">
                {expiringItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No items expiring in the next 30 days
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Days Left</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringItems.map((item) => {
                        const daysLeft = differenceInDays(
                          new Date(item.expiry_date!),
                          new Date()
                        );
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              {format(new Date(item.expiry_date!), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                            <Badge variant={daysLeft <= 7 ? "destructive" : "secondary"}>
                              {daysLeft} days
                            </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddInventoryItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
