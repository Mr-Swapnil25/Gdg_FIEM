import {useAuthContext} from "@/contexts/AuthContext";
import {useToast} from "@/components/ui/use-toast";
import {usePathname, useRouter} from "next/navigation";

const DASHBOARD_URL = "/dashboard";

const useAuth = () => {
  const {user, loading, loginWithGoogle, error} = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const {toast} = useToast();

  const isAuthenticated = Boolean(user);
  const isCurrentPathDashboard = pathname === DASHBOARD_URL;
  const isCurrentPathHome = pathname === "/";

  const openSignInPopupOrDirect = async () => {
    if (loading) return;
    if (!user) {
      try {
        await loginWithGoogle();
        router.push(DASHBOARD_URL);
      } catch (signInError) {
        console.error("Google sign-in failed:", signInError);
        const errorMessage =
          signInError instanceof Error ? signInError.message : "Unable to sign in.";
        toast({
          title: "Authentication error",
          description:
            error ??
            errorMessage ??
            "Unable to sign in. Check Firebase configuration and try again.",
          variant: "destructive",
        });
      }
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
