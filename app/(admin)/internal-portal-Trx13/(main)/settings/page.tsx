import AdminSettingsPage from "@/components/pages/admin/adminSettingsPage";
import SystemManagementPage from "@/components/pages/admin/systemManagementPage";

export default function Page() {
  return (
    <div className="space-y-6">
      <SystemManagementPage />
      <div className="mt-8">
        <AdminSettingsPage />
      </div>
    </div>
  );
}



