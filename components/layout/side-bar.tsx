"use client";
import TranxBitLogo from "../design/tranx-bit-logo";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/modals/confirmation-modal";
// import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  ShoppingCart,
  BadgeDollarSign,
  Receipt,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  CreditCard,
  Wallet,
} from "lucide-react";

export const AdminBaseRoute = "/internal-portal-Trx13";
interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
  userType?: "user" | "admin";
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({
  onCollapse,
  userType = "user",
  isOpen = false,
  onClose,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure parent component knows initial state
  useEffect(() => {
    onCollapse?.(isCollapsed);
  }, [isCollapsed, onCollapse]);

  // User navigation items (default)
  const userNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    // Hiding "Buy Gift Card" for now - prioritizing core features for MVP
    /* {
      id: "buy",
      label: "Buy Gift Card",
      icon: ShoppingCart,
      href: "/buy-giftcards",
    }, */
    {
      id: "sell",
      label: "Sell Gift Card",
      icon: BadgeDollarSign,
      href: "/sell-giftcards",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Receipt,
      href: "/transactions",
    },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ];

  // Admin navigation items
  const adminNavItems = [
    // {
    //   id: "dashboard",
    //   label: "Dashboard",
    //   icon: LayoutDashboard,
    //   href: `${AdminBaseRoute}/dashboard`,
    // },
    {
      id: "cards",
      label: "Cards",
      icon: CreditCard,
      href: `${AdminBaseRoute}/cards`,
    },
    {
      id: "orders",
      label: "Orders",
      icon: Receipt,
      href: `${AdminBaseRoute}/orders`,
    },
    // {
    //   id: "users",
    //   label: "Users",
    //   icon: Users,
    //   href: `${AdminBaseRoute}/users`,
    // },
    // {
    //   id: "settings",
    //   label: "Settings",
    //   icon: Settings,
    //   href: `${AdminBaseRoute}/settings`,
    // },
  ];

  const navItems = userType === "admin" ? adminNavItems : userNavItems;

  const bottomItems = [
    // { id: "profile", label: "Profile", icon: User, href: "/profile" },
    { id: "logout", label: "Logout", icon: LogOut, href: "/logout" },
  ];

  const NavItem = ({ item }: { item: (typeof navItems)[number] }) => {
    // Use startsWith for buy and sell routes to keep them active on sub-routes
    const isActive =
      item.href === "/buy-giftcards" ||
        item.href === "/sell-giftcards" ||
        item.href === "/transactions" ||
        item.href.includes(`${AdminBaseRoute}/`)
        ? pathname.startsWith(item.href)
        : pathname === item.href;

    // Special handling for logout button
    const isLogout = item.id === "logout";

    const buttonContent = (
      <Button
        variant="ghost"
        onClick={
          isLogout
            ? (e) => {
              e.preventDefault();
              setShowLogoutModal(true);
            }
            : undefined
        }
        className={`
          w-full flex items-center gap-3 justify-start h-12 rounded-lg transition-all duration-300
          ${isActive
            ? // Active state with fafafa background and gray text
            "bg-primary/10 text-primary"
            : // Inactive state with hover
            "hover:bg-muted"
          }
          ${isCollapsed ? "justify-center px-0" : "px-4"}
        `}
      >
        <item.icon
          className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-700" : ""}`}
          strokeWidth={isActive ? 2.5 : 1.5}
        />
        {!isCollapsed && <span className="font-medium">{item.label}</span>}
      </Button>
    );

    const content = isCollapsed ? (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      buttonContent
    );

    // Wrap with Link only if not logout
    return isLogout ? (
      <div onClick={() => onClose?.()}>{content}</div>
    ) : (
      <Link
        href={item.href}
        className="block"
        onClick={() => onClose?.()}
      >
        {content}
      </Link>
    );
  };

  const SidebarContent = () => {
    const logoVariant = mounted && theme === "dark" ? "light" : "dark";

    return (
      <>
        {/* Logo Area */}
        <div
          className={`p-6 bg-transparent border-b border-borderColorPrimary ${isCollapsed ? "px-4" : ""
            }`}
        >
          {/* <TranxBitLogo size="medium" variant={logoVariant} /> */}
          {isCollapsed ? (
            <TranxBitLogo size="small" variant={logoVariant} isMobile={true} />
          ) : (
            <TranxBitLogo size="medium" variant={logoVariant} />
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 bg-transparent px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Bottom Items */}
        <div className="px-4 bg-transparent py-6 border-t border-borderColorPrimary space-y-2">
          <div className="mb-2">
            {/* <ThemeToggle /> */}
          </div>
          {bottomItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 h-full w-72 bg-sideBarBackground border-r border-borderColorPrimary z-50 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="w-5 h-5" />
        </Button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex fixed top-0 left-0 h-full bg-sideBarBackground border-r border-borderColorPrimary z-30
          flex-col transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        <SidebarContent />

        {/* Collapse Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const newState = !isCollapsed;
            setIsCollapsed(newState);
            onCollapse?.(newState);
          }}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          // Logout logic will be implemented when backend is ready
          // For now, redirect to auth page
          window.location.href = "/auth";
        }}
        title="Logout"
        description="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        variant="default"
      />
    </>
  );
};

export default Sidebar;
