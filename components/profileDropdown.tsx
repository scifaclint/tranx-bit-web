import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
const ProfileDropdown = () => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter(); // Uncommented for settings navigation

  const { user, clearAuth } = useAuthStore();

  // Derived state from real user data
  const userName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "User";
  const userEmail = user?.email || "user@example.com";
  // Assuming user has a photo_url field or fallback
  const userImage = user?.photo_url || "/profiles/avatarImage.jpg";

  const initials = (user?.first_name?.[0] || "U") + (user?.last_name?.[0] || "");

  const handleSettings = () => {
    router.push("/settings"); // Assuming settings route
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    // You might want to call api.logout() here too
    await authApi.logout();
    clearAuth();
    setShowLogoutDialog(false);
    router.replace("/auth");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 dark:bg-backgroundSecondary">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="w-12 h-12">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback className="text-xs">{initials.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate">{userName}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">{userEmail}</span>
            </div>
          </div>
          <div className="my-1 h-px bg-border" />
          <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogoutClick}
            className="cursor-pointer text-red-700 hover:bg-red-200 hover:text-red-800"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-0">
            <Button
              variant="outline"

              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutConfirm}
              className="bg-red-600 ml-2 hover:bg-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDropdown;
