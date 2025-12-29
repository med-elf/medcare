import { Bell, Search, Plus, HelpCircle, LogOut, User, Keyboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, profile, signOut, roles } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getRoleLabel = () => {
    if (roles.length === 0) return 'No Role Assigned';
    const role = roles[0]?.role;
    const roleLabels: Record<string, string> = {
      clinic_admin: 'Clinic Admin',
      provider: 'Provider',
      reception: 'Reception',
      patient: 'Patient',
    };
    return roleLabels[role] || role;
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40 px-6 flex items-center justify-between">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold text-foreground"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary-dark shadow-sm">
              <Plus className="w-4 h-4" />
              Quick Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>New Patient</DropdownMenuItem>
            <DropdownMenuItem>New Appointment</DropdownMenuItem>
            <DropdownMenuItem>New Invoice</DropdownMenuItem>
            <DropdownMenuItem>New Prescription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary" className="text-xs">3 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  <span className="font-medium text-sm">New appointment request</span>
                </div>
                <span className="text-xs text-muted-foreground pl-4">
                  John Smith requested an appointment for tomorrow
                </span>
                <span className="text-xs text-muted-foreground pl-4">5 min ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-warning rounded-full" />
                  <span className="font-medium text-sm">Low inventory alert</span>
                </div>
                <span className="text-xs text-muted-foreground pl-4">
                  Dental composite running low (5 units left)
                </span>
                <span className="text-xs text-muted-foreground pl-4">1 hour ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-success rounded-full" />
                  <span className="font-medium text-sm">Payment received</span>
                </div>
                <span className="text-xs text-muted-foreground pl-4">
                  Maria Garcia paid $250 via eSewa
                </span>
                <span className="text-xs text-muted-foreground pl-4">2 hours ago</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary text-sm">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline">{getDisplayName()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{getDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className="mt-1 text-xs">{getRoleLabel()}</Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="w-4 h-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Keyboard className="w-4 h-4 mr-2" />
              Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
