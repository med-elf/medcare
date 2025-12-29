import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
}

function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen">
      <Header title={title} subtitle={subtitle} />
      <div className="p-6">
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent>
            <Construction className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">This module is under development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MedicalRecords() {
  return <PlaceholderPage title="Medical Records" subtitle="SOAP notes and prescriptions" />;
}

export function Inventory() {
  return <PlaceholderPage title="Inventory" subtitle="Stock management and alerts" />;
}

export function Reports() {
  return <PlaceholderPage title="Reports & Analytics" subtitle="Clinic performance metrics" />;
}

export function Messages() {
  return <PlaceholderPage title="Messages" subtitle="Patient and staff communications" />;
}

export function Settings() {
  return <PlaceholderPage title="Settings" subtitle="Clinic configuration and preferences" />;
}
