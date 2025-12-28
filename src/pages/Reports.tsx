import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { useRevenueStats, usePaymentMethodStats } from "@/hooks/useDashboard";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--destructive))"];

export default function Reports() {
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueStats(30);
  const { data: paymentMethods = [], isLoading: paymentLoading } = usePaymentMethodStats();
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();

  // Calculate gender distribution
  const genderData = patients.reduce((acc, patient) => {
    const gender = patient.gender || "Unknown";
    const existing = acc.find((item) => item.name === gender);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: gender, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Calculate appointment types distribution
  const appointmentTypeData = appointments.reduce((acc, apt) => {
    const type = apt.appointment_type.replace("_", " ");
    const existing = acc.find((item) => item.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Format revenue data for chart
  const formattedRevenue = revenueData.map((item) => ({
    date: format(new Date(item.date), "MMM d"),
    amount: item.amount,
  }));

  return (
    <div className="min-h-screen">
      <Header title="Reports & Analytics" subtitle="Clinic performance metrics and insights" />

      <div className="p-6 space-y-6">
        {/* Revenue Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : formattedRevenue.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No revenue data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formattedRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : paymentMethods.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No payment data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={paymentMethods.map((pm) => ({
                          name: pm.method,
                          value: pm.amount,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethods.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Patient Demographics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Patient Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                {patientsLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : genderData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No patient data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Appointment Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Appointment Types</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : appointmentTypeData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No appointment data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={appointmentTypeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs capitalize" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <p className="text-3xl font-bold text-primary">{patients.length}</p>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <p className="text-3xl font-bold text-success">{appointments.length}</p>
                    <p className="text-sm text-muted-foreground">Total Appointments</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-info/10">
                    <p className="text-3xl font-bold text-info">
                      {appointments.filter((a) => a.status === "completed").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-warning/10">
                    <p className="text-3xl font-bold text-warning">
                      {appointments.filter((a) => !!a.telemedicine_link).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Telemedicine</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
