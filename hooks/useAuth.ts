import {useAuthContext} from "@/contexts/AuthContext";
import {usePathname, useRouter} from "next/navigation";

const DASHBOARD_URL = "/dashboard";

const useAuth = () => {
  const {user, loading, loginWithGoogle} = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthenticated = Boolean(user);
  const isCurrentPathDashboard = pathname === DASHBOARD_URL;
  const isCurrentPathHome = pathname === "/";

  const openSignInPopupOrDirect = async () => {
    if (loading) return;
    if (!user) {
      await loginWithGoogle();
      router.push(DASHBOARD_URL);
      return;
    }
    router.push(DASHBOARD_URL);
  };

  return {
    isCurrentPathDashboard,
    isCurrentPathHome,
    openSignInPopupOrDirect,
    isAuthenticated,
    isLoading: loading,
  };
};

export default useAuth;
