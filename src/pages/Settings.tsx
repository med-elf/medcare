import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  CreditCard,
  LogOut,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, profile, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      clinic_admin: "Clinic Admin",
      provider: "Provider",
      reception: "Reception",
      patient: "Patient",
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen">
      <Header title="Settings" subtitle="Manage your account and clinic preferences" />

      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="clinic" className="gap-2">
              <Building2 className="w-4 h-4" />
              Clinic
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and profile picture
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm">
                          Change Photo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, GIF or PNG. Max 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input defaultValue={profile?.first_name || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input defaultValue={profile?.last_name || ""} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input defaultValue={user?.email || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input defaultValue={profile?.phone || ""} placeholder="+1 (555) 000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Specialization</Label>
                        <Input
                          defaultValue={profile?.specialization || ""}
                          placeholder="e.g., General Dentistry"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                          defaultValue={profile?.bio || ""}
                          placeholder="Tell us about yourself..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <Button className="w-full" disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Account Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>
                      Your account information and roles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Roles</span>
                      <div className="flex gap-2">
                        {roles.length === 0 ? (
                          <Badge variant="secondary">No Role</Badge>
                        ) : (
                          roles.map((r) => (
                            <Badge key={r.id} variant="outline">
                              {getRoleLabel(r.role)}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span className="text-sm font-medium">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="clinic">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Clinic Settings</CardTitle>
                  <CardDescription>
                    Manage your clinic's information and branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Clinic Name</Label>
                      <Input placeholder="Your Clinic Name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Clinic Type</Label>
                      <Input placeholder="e.g., Dental Clinic" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="clinic@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Textarea placeholder="Full clinic address" rows={2} />
                    </div>
                  </div>
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Clinic Settings
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      title: "Email Notifications",
                      description: "Receive email updates about appointments and payments",
                    },
                    {
                      title: "SMS Notifications",
                      description: "Get text messages for urgent alerts",
                    },
                    {
                      title: "Appointment Reminders",
                      description: "Send automatic reminders to patients",
                    },
                    {
                      title: "Low Stock Alerts",
                      description: "Get notified when inventory is running low",
                    },
                    {
                      title: "Payment Confirmations",
                      description: "Receive notifications for payment verifications",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked={i < 3} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
