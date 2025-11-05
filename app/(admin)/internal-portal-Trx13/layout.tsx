
import { ReactNode, FC } from "react";

interface LayoutProps {
  children: ReactNode;
}

const DashboardLayout: FC<LayoutProps> = ({ children }) => {
  return <>{children}</>;
};

export default DashboardLayout;
