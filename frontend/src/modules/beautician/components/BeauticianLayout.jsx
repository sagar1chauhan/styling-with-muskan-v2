import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useBeauticianAuth } from "@/modules/beautician/contexts/BeauticianAuthContext";
import BeauticianSidebar from "@/modules/beautician/components/BeauticianSidebar";
import BeauticianBottomNav from "@/modules/beautician/components/BeauticianBottomNav";
import BeauticianHeader from "@/modules/beautician/components/BeauticianHeader";

const BeauticianLayout = () => {
    const { isLoggedIn, isApproved, isPending, isRegistered } = useBeauticianAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Enforce Professional Beautician Theme
        document.documentElement.classList.remove("theme-women", "theme-men");
        document.documentElement.classList.add("theme-beautician");

        return () => {
            document.documentElement.classList.remove("theme-beautician");
            const savedGender = localStorage.getItem("muskan-gender") || "women";
            document.documentElement.classList.add(`theme-${savedGender}`);
        };
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/beautician/login", { replace: true });
            return;
        }
        if (isLoggedIn && !isRegistered) {
            navigate("/beautician/register", { replace: true });
            return;
        }
        if (isPending) {
            navigate("/beautician/pending", { replace: true });
            return;
        }
    }, [isLoggedIn, isRegistered, isPending, navigate]);

    // Isolated render for specialized entry states
    if (!isLoggedIn || !isRegistered || isPending) {
        return <Outlet />;
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary antialiased">
            {/* Desktop Navigation */}
            <BeauticianSidebar />

            <div className="flex-1 flex flex-col min-h-screen relative">
                {/* Global Header */}
                <BeauticianHeader />

                {/* Viewport Core */}
                <main className="flex-1 pb-24 lg:pb-8 overflow-y-auto scroll-smooth">
                    <div className="w-full max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Navigation */}
                <BeauticianBottomNav />
            </div>
        </div>
    );
};

export default BeauticianLayout;
