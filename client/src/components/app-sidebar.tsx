import {
  Home,
  Building2,
  Users,
  Briefcase,
  Receipt,
  Calculator,
  BarChart3,
  FolderOpen,
  Settings,
  CreditCard,
  FileText,
  DollarSign,
  User,
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
} from "@/components/ui/sidebar";
import { Link } from "wouter";

interface AppSidebarProps {
  role: string;
}

interface NavSection {
  title: string;
  items: {
    title: string;
    url: string;
    icon: any;
  }[];
}

export function AppSidebar({ role }: AppSidebarProps) {
  const boardManagementSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", url: "/", icon: Home },
      ],
    },
    {
      title: "Financial",
      items: [
        { title: "Invoices", url: "/invoices", icon: Receipt },
        { title: "Budgets", url: "/budgets", icon: Calculator },
        { title: "Reports", url: "/reports", icon: BarChart3 },
        { title: "Units & Ledgers", url: "/units", icon: Building2 },
      ],
    },
    {
      title: "Operations",
      items: [
        { title: "Owners", url: "/owners", icon: Users },
        { title: "Vendors", url: "/vendors", icon: Briefcase },
        { title: "Assessments", url: "/assessments", icon: DollarSign },
        { title: "Payments", url: "/payments", icon: CreditCard },
        { title: "Documents", url: "/documents", icon: FolderOpen },
      ],
    },
    {
      title: "Admin",
      items: [
        { title: "Settings", url: "/settings", icon: Settings },
      ],
    },
  ];

  const ownerSections: NavSection[] = [
    {
      title: "Owner Portal",
      items: [
        { title: "My Account", url: "/", icon: Home },
        { title: "Make Payment", url: "/payment", icon: CreditCard },
        { title: "Payment History", url: "/history", icon: FileText },
        { title: "My Profile", url: "/profile", icon: User },
      ],
    },
  ];

  const sections = role === "owner" ? ownerSections : boardManagementSections;

  return (
    <Sidebar data-testid="sidebar" className="border-r border-border/40">
      <SidebarContent className="py-4">
        {sections.map((section) => (
          <SidebarGroup key={section.title} className="mb-2">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-4 mb-2">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      className="group transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
