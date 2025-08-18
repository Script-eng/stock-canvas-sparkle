import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  PieChart, 
  Activity, 
  Settings,
  User,
  LogOut,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  // Assuming your main dashboard is the root path
  { title: "Markets", url: "/", icon: TrendingUp }, 
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Portfolio", url: "/portfolio", icon: Wallet },
  { title: "Analytics", url: "/analytics", icon: PieChart },
  { title: "Activity", url: "/activity", icon: Activity },
]

const accountItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function StockSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-card border-r">
        {/* Logo/Brand */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg text-foreground">StockEx</h2>
                <p className="text-xs text-muted-foreground">Trading Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
            Trading
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1">
                    {/* --- THE FIX IS HERE --- */}
                    {/* We now use a more explicit className logic */}
                    <NavLink to={item.url} end={item.url === "/"}>
                      {({ isActive }) => (
                        <div
                          className={`flex items-center w-full rounded-md p-2 transition-colors ${
                            isActive
                              ? 'bg-muted text-foreground font-medium' // Active link style
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground' // Inactive link style
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {!isCollapsed && <span className="ml-3">{item.title}</span>}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account Section (with similar fix) */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1">
                    <NavLink to={item.url}>
                       {({ isActive }) => (
                        <div
                          className={`flex items-center w-full rounded-md p-2 transition-colors ${
                            isActive
                              ? 'bg-muted text-foreground font-medium'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {!isCollapsed && <span className="ml-3">{item.title}</span>}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton className="mb-1 w-full flex items-center p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="w-5 h-5" />
                  {!isCollapsed && <span className="ml-3">Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}