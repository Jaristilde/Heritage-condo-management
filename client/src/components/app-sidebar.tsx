import {
  Home,
  Building2,
  DollarSign,
  FileText,
  Users,
  Settings,
  BarChart3,
  CreditCard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Link } from "wouter";

interface AppSidebarProps {
  role: string;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const boardManagementItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Units & Owners",
      url: "/units",
      icon: Building2,
    },
    {
      title: "Payments",
      url: "/payments",
      icon: CreditCard,
    },
    {
      title: "Financial Reports",
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: "Assessments",
      url: "/assessments",
      icon: DollarSign,
    },
    {
      title: "Vendors",
      url: "/vendors",
      icon: Users,
    },
    {
      title: "Documents",
      url: "/documents",
      icon: FileText,
    },
  ];

  const ownerItems = [
    {
      title: "My Account",
      url: "/",
      icon: Home,
    },
    {
      title: "Make Payment",
      url: "/payment",
      icon: CreditCard,
    },
    {
      title: "Payment History",
      url: "/history",
      icon: FileText,
    },
  ];

  const menuItems = role === "owner" ? ownerItems : boardManagementItems;

  return (
    <Sidebar data-testid="sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-lg font-bold">Heritage</h2>
            <p className="text-xs text-muted-foreground">Condominium Association</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{role === "owner" ? "Owner Portal" : "Management"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
