import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    ShieldCheck,
    Clock,
    XCircle,
    AlertTriangle,
    MessageCircle,
    ChevronLeft,
    RotateCcw,
    FileUp
} from "lucide-react";
import { Button } from "@/modules/user/components/ui/button";
import { Card, CardContent } from "@/modules/user/components/ui/card";
import { useProviderAuth } from "@/modules/serviceprovider/contexts/ProviderAuthContext";

export default function ProviderStatusPage() {
    const navigate = useNavigate();
    const { provider, isApproved, adminApprove, adminReject, logout } = useProviderAuth();
    const status = provider?.approvalStatus || "pending"; // pending, approved, rejected, suspended

    React.useEffect(() => {
        if (isApproved) {
            const timer = setTimeout(() => {
                logout();
                navigate("/provider/login", { replace: true });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isApproved, navigate, logout]);

    const statusConfigs = {
        pending: {
            icon: Clock,
            iconClass: "bg-blue-50 text-blue-600",
            title: "Verification in Progress",
            description: "Thanks for applying! Our team is currently reviewing your documents and portfolio. You'll receive a notification within 24–48 hours.",
            badge: "Under Review",
            badgeClass: "bg-blue-100 text-blue-700",
            buttonText: "Join Community",
            onButtonClick: () => { }
        },
        approved: {
            icon: ShieldCheck,
            iconClass: "bg-green-50 text-green-600",
            title: "Profile Approved!",
            description: "Congratulations! Your professional profile is now active. You can start buying job leads and growing your business.",
            badge: "Active Partner",
            badgeClass: "bg-green-100 text-green-700",
            buttonText: "Go to Dashboard",
            onButtonClick: () => navigate("/provider/dashboard")
        },
        rejected: {
            icon: XCircle,
            iconClass: "bg-red-50 text-red-600",
            title: "Application Rejected",
            description: "We couldn't approve your profile due to a mismatch in your KYC documents (Aadhar name doesn't match profile). Please re-upload clear photos.",
            badge: "Action Required",
            badgeClass: "bg-red-100 text-red-700",
            buttonText: "Re-upload Documents",
            onButtonClick: () => navigate("/provider/register"),
            secondaryAction: true
        },
        suspended: {
            icon: AlertTriangle,
            iconClass: "bg-amber-50 text-amber-600",
            title: "Account Suspended",
            description: "Your account has been temporarily suspended due to high cancellation rates. Please contact your hub manager to reactivate.",
            badge: "Suspended",
            badgeClass: "bg-amber-100 text-amber-900",
            buttonText: "Contact Support",
            onButtonClick: () => { },
            isCritical: true
        }
    };

    const config = statusConfigs[status] || statusConfigs.pending;
    const Icon = config.icon;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
                <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center">
                    <div className="w-full flex justify-between items-center mb-10">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="h-6 w-6 text-gray-400" />
                        </button>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${config.badgeClass}`}>
                            {config.badge}
                        </div>
                    </div>

                    <div className={`w-24 h-24 rounded-[32px] ${config.iconClass} flex items-center justify-center mb-8 shadow-inner`}>
                        <Icon className="h-12 w-12 stroke-[2.5px]" />
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{config.title}</h1>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed mb-10 px-4">
                        {config.description}
                    </p>

                    <div className="w-full space-y-4">
                        <Button
                            className={`w-full h-14 rounded-2xl font-black text-lg transition-all active:scale-[0.98] ${config.isCritical
                                ? "bg-amber-600 hover:bg-amber-700"
                                : status === 'approved'
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-violet-600 hover:bg-violet-700"
                                } text-white shadow-xl shadow-violet-100 border-none`}
                            onClick={config.onButtonClick}
                        >
                            {status === 'rejected' && <FileUp className="mr-2 h-5 w-5" />}
                            {config.buttonText}
                        </Button>

                        {status === 'rejected' && (
                            <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-gray-500">
                                <RotateCcw className="mr-2 h-4 w-4" /> View Reason
                            </Button>
                        )}

                        <Button variant="outline" className="w-full h-14 rounded-2xl border-gray-100 font-black text-gray-600 flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Talk to Support
                        </Button>

                        {/* Mock Admin Controls - Hidden in Production usually */}
                        <div className="p-4 border-2 border-dashed border-violet-200 rounded-[24px] bg-violet-50/50 mt-4">
                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest text-center mb-3">Admin Simulation</p>
                            <div className="flex gap-2">
                                <Button
                                    onClick={adminApprove}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs h-10"
                                >
                                    Approve
                                </Button>
                                <Button
                                    onClick={adminReject}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs h-10"
                                >
                                    Reject
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-50 w-full">
                        <img src="/logo1.png" alt="SWM" className="h-12 w-12 rounded-full object-cover mx-auto opacity-50 grayscale hover:opacity-100 transition-all shadow-sm" />
                        <p className="text-[10px] font-black uppercase text-gray-300 mt-2 tracking-widest">Styling with Muskan</p>
                    </div>
                </CardContent>
            </Card>

            {/* Background Decorative Circles */}
            <div className="fixed top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        </div>
    );
}
