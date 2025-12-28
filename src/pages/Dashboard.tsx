import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { useDashboardStats, useRecentPatients } from "@/hooks/useDashboard";
import { useTodayAppointments } from "@/hooks/useAppointments";
import { useLowStockItems } from "@/hooks/useInventory";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Package,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentPatients = [], isLoading: patientsLoading } = useRecentPatients();
  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useTodayAppointments();
  const { data: lowStockItems = [], isLoading: inventoryLoading } = useLowStockItems();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayName = profile?.first_name
    ? `${greeting()}, ${profile.first_name}`
    : greeting();

  return (
    <div className="min-h-screen">
      <Header title={displayName} subtitle="Here's what's happening at your clinic today" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-6"
      >
        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : (
            <>
              <StatCard
                title="Today's Patients"
                value={stats?.todayAppointments?.toString() || "0"}
                icon={Users}
                color="primary"
              />
              <StatCard
                title="Appointments"
                value={stats?.todayAppointments?.toString() || "0"}
                icon={Calendar}
                color="info"
              />
              <StatCard
                title="Today's Revenue"
                value={`$${(stats?.todayRevenue || 0).toLocaleString()}`}
                icon={DollarSign}
                color="success"
              />
              <StatCard
                title="Pending Payments"
                value={`$${(stats?.pendingAmount || 0).toLocaleString()}`}
                icon={TrendingUp}
                color="warning"
              />
            </>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {todayAppointments.length} appointments scheduled
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/appointments")}>
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointmentsLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)
                ) : todayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No appointments scheduled for today
                  </div>
                ) : (
                  todayAppointments.slice(0, 4).map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AppointmentCard
                        appointment={{
                          id: appointment.id,
                          patientName: appointment.title,
                          time: appointment.start_time.slice(0, 5),
                          duration: "30 min",
                          type: appointment.appointment_type as any,
                          status: appointment.status.replace("_", "-") as any,
                          isTelemedicine: !!appointment.telemedicine_link,
                        }}
                      />
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Users, label: "New Patient", color: "primary", path: "/patients" },
                    { icon: Calendar, label: "Book Apt.", color: "info", path: "/appointments" },
                    { icon: DollarSign, label: "New Invoice", color: "success", path: "/billing" },
                    { icon: Activity, label: "Inventory", color: "warning", path: "/inventory" },
                  ].map((action, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(action.path)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-${action.color}/10 flex items-center justify-center`}>
                        <action.icon className={`w-5 h-5 text-${action.color}`} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{action.label}</span>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Patients */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg font-semibold">Recent Patients</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/patients")}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patientsLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      </div>
                    ))
                  ) : recentPatients.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No patients yet
                    </p>
                  ) : (
                    recentPatients.map((patient, i) => (
                      <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => navigate(`/patients?id=${patient.id}`)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={patient.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {patient.first_name[0]}{patient.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">Recently added</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Alerts */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold">Inventory Alerts</CardTitle>
                  {lowStockItems.length > 0 && (
                    <Badge variant="destructive" className="text-xs">{lowStockItems.length}</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>
                  <Package className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {inventoryLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)
                ) : lowStockItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All stock levels are good
                  </p>
                ) : (
                  lowStockItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <Badge
                          variant={item.quantity <= 5 ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {item.quantity} left
                        </Badge>
                      </div>
                      <Progress
                        value={(item.quantity / item.min_quantity) * 100}
                        className={`h-2 ${
                          item.quantity <= 5
                            ? "[&>div]:bg-destructive"
                            : "[&>div]:bg-warning"
                        }`}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Summary */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.appointmentStatuses?.completed || 0}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(stats?.todayAppointments || 0) - (stats?.appointmentStatuses?.completed || 0) - (stats?.appointmentStatuses?.cancelled || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.appointmentStatuses?.cancelled || 0}</p>
                    <p className="text-sm text-muted-foreground">Cancelled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Status */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Collected Today</p>
                    <p className="text-2xl font-bold text-success">
                      ${(stats?.todayRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-warning">
                      ${(stats?.pendingAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                {((stats?.todayRevenue || 0) + (stats?.pendingAmount || 0)) > 0 && (
                  <>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
                      <div
                        className="h-full bg-success"
                        style={{
                          width: `${((stats?.todayRevenue || 0) / ((stats?.todayRevenue || 0) + (stats?.pendingAmount || 0))) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-warning"
                        style={{
                          width: `${((stats?.pendingAmount || 0) / ((stats?.todayRevenue || 0) + (stats?.pendingAmount || 0))) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <span className="text-muted-foreground">Collected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-warning" />
                        <span className="text-muted-foreground">Pending</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
