import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Package,
  BarChart3,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  ImageIcon,
  LogOut,
  Moon,
  Sun,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Patients", path: "/patients" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: FileText, label: "Medical Records", path: "/records" },
  { icon: DollarSign, label: "Billing", path: "/billing" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: ImageIcon, label: "Showcase", path: "/showcase" },
  { icon: MessageSquare, label: "Messages", path: "/messages", badge: 3 },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const { user, profile, signOut, roles } = useAuth();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

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
    if (roles.length === 0) return 'No Role';
    const role = roles[0]?.role;
    const roleLabels: Record<string, string> = {
      clinic_admin: 'Admin',
      provider: 'Provider',
      reception: 'Reception',
      patient: 'Patient',
    };
    return roleLabels[role] || role;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">MedElf</h1>
                <p className="text-xs text-muted-foreground">Healthcare Suite</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-3"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Quick search..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary/50 border border-transparent focus:border-primary/30 focus:bg-card text-sm placeholder:text-muted-foreground outline-none transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground transition-all relative group",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-sidebar-primary"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {item.badge && !collapsed && (
                    <Badge variant="default" className="ml-auto h-5 px-1.5 text-xs bg-primary">
                      {item.badge}
                    </Badge>
                  )}
                  {item.badge && collapsed && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-3">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className={cn(
            "w-full mb-2 justify-start gap-3",
            collapsed && "justify-center px-0"
          )}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-warning" />
          ) : (
            <Moon className="w-5 h-5 text-muted-foreground" />
          )}
          {!collapsed && <span className="text-sm">Dark Mode</span>}
        </Button>

        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer transition-colors",
          collapsed && "justify-center"
        )}>
          <Avatar className="w-9 h-9">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getDisplayName()}</p>
              <p className="text-xs text-muted-foreground truncate">{getRoleLabel()}</p>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={cn(
            "w-full mt-2 justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm hover:bg-secondary"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>
    </motion.aside>
  );
}
