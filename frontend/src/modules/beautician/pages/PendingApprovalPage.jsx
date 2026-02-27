import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Check, FileText, Shield, Phone, Loader2, AlertCircle, ArrowRightCircle } from "lucide-react";
import { useBeauticianAuth } from "@/modules/beautician/contexts/BeauticianAuthContext";
import { Button } from "@/modules/user/components/ui/button";

const PendingApprovalPage = () => {
    const navigate = useNavigate();
    const { beautician, isApproved, mockApprove } = useBeauticianAuth();

    useEffect(() => {
        document.documentElement.classList.remove("theme-women", "theme-men");
        document.documentElement.classList.add("theme-beautician");
    }, []);

    useEffect(() => {
        if (isApproved) navigate("/beautician/dashboard", { replace: true });
    }, [isApproved, navigate]);

    const docs = [
        { label: "Identity Verification", status: "verified", icon: Shield },
        { label: "Aadhaar Card Copy", status: beautician?.documents?.aadhaar ? "submitted" : "missing", icon: FileText },
        { label: "PAN Card Repository", status: beautician?.documents?.pan ? "submitted" : "missing", icon: FileText },
        { label: "Banking Documents", status: beautician?.documents?.bankDetails ? "submitted" : "missing", icon: AlertCircle },
        { label: "Professional Certificate", status: beautician?.documents?.certification ? "submitted" : "missing", icon: FileText },
    ];

    return (
        <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background min-h-screen py-12 px-6 flex flex-col items-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-20 h-20 rounded-full bg-card border border-primary/20 shadow-xl shadow-primary/5 flex items-center justify-center mb-8 relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-transparent border-t-primary/40 rounded-full" />
                <Clock className="w-8 h-8 text-primary" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 space-y-2">
                <h1 className="text-xl font-black text-foreground tracking-tight underline-offset-4 decoration-primary/20 underline">Application Under Review</h1>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto font-medium leading-relaxed">
                    Our administrative team is verifying your professional credentials. Verification typically concludes within <span className="text-primary font-bold">24-48 Business Hours</span>.
                </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="w-full max-w-md bg-card border border-border/50 rounded-[--radius] p-6 shadow-sm">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-5 opacity-60">Verification Checklist</p>
                <div className="space-y-4">
                    {docs.map((doc, i) => (
                        <motion.div key={doc.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                            className="flex items-center justify-between pb-3 border-b border-border/30 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                    <doc.icon className="w-4 h-4 text-muted-foreground/60" />
                                </div>
                                <span className="text-[11px] font-bold text-foreground">{doc.label}</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm border ${doc.status === "verified" ? "bg-green-500/5 text-green-600 border-green-500/10" :
                                    doc.status === "submitted" ? "bg-primary/5 text-primary border-primary/10" :
                                        "bg-destructive/5 text-destructive border-destructive/10"
                                }`}>
                                {doc.status === "verified" ? "Verified" : doc.status === "submitted" ? "Pending Approval" : "Missing Entry"}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12 space-y-4 w-full max-w-md">
                <Button onClick={mockApprove} variant="outline"
                    className="w-full h-11 border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5 rounded-[--radius] text-[10px] font-black uppercase tracking-widest gap-2">
                    <ArrowRightCircle className="w-3.5 h-3.5" /> Skip Review (Developer Mode)
                </Button>

                <div className="pt-4 flex flex-col items-center gap-2">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Administrative Support</p>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/20 border border-border/30 rounded-full">
                        <Phone className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-foreground">+91 98765 43210</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PendingApprovalPage;

