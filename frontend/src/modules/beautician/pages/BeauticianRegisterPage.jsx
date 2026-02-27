import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, FileText, Landmark, Award, ChevronRight, ChevronLeft, Check, Upload, Shield, CheckCircle2 } from "lucide-react";
import { useBeauticianAuth } from "@/modules/beautician/contexts/BeauticianAuthContext";
import { Button } from "@/modules/user/components/ui/button";

const steps = [
    { id: 1, label: "Personal", icon: User },
    { id: 2, label: "Identity", icon: Shield },
    { id: 3, label: "Banking", icon: Landmark },
    { id: 4, label: "Skills", icon: Award },
    { id: 5, label: "Review", icon: CheckCircle2 },
];

const BeauticianRegisterPage = () => {
    const navigate = useNavigate();
    const { beautician, register } = useBeauticianAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "", email: "", experience: "",
        aadhaar: null, pan: null,
        bankName: "", accountNumber: "", ifsc: "",
        certification: null, specialties: []
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (field, file) => {
        if (file) {
            handleChange(field, { name: file.name, size: file.size, uploaded: true });
        }
    };

    const handleSubmit = () => {
        register({
            phone: beautician?.phone || "9999999999",
            ...formData,
            bankDetails: {
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                ifsc: formData.ifsc,
            }
        });
        navigate("/beautician/pending");
    };

    const canProceed = () => {
        switch (step) {
            case 1: return formData.name.trim().length > 0;
            case 2: return formData.aadhaar && formData.pan;
            case 3: return formData.bankName && formData.accountNumber && formData.ifsc;
            case 4: return formData.certification;
            case 5: return true;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background py-8 px-4 pb-24">
            <div className="max-w-xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-xl font-bold text-foreground">Partner Registration</h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">Step {step} of 5 • Verification Required</p>
                </div>

                {/* Minimalist Progress Indicator */}
                <div className="flex justify-between items-center px-2 mb-10 relative">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-muted z-0 mx-8" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary z-0 mx-8 transition-all duration-500" style={{ width: `${((step - 1) / 4) * 88}%` }} />
                    {steps.map((s) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.id ? "bg-primary border-primary text-white shadow-sm" : "bg-card border-border text-muted-foreground"}`}>
                                {step > s.id ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-[9px] font-bold mt-1.5 uppercase tracking-tighter ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <motion.div layout className="bg-card border border-border rounded-[--radius] shadow-sm p-6 overflow-hidden min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                            {step === 1 && (
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><User className="w-4 h-4 text-primary" /> Personal Details</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Full Name</label><input type="text" value={formData.name} onChange={e => handleChange("name", e.target.value)} className="w-full h-10 px-4 bg-muted/30 border border-border rounded-[--radius] text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all" /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Email Address</label><input type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} className="w-full h-10 px-4 bg-muted/30 border border-border rounded-[--radius] text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all" /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Work Experience</label>
                                            <select value={formData.experience} onChange={e => handleChange("experience", e.target.value)} className="w-full h-10 px-4 bg-muted/30 border border-border rounded-[--radius] text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                                                <option value="">Select experience</option>
                                                <option value="0-1">0 - 1 year</option>
                                                <option value="1-3">1 - 3 years</option>
                                                <option value="3-5">3 - 5 years</option>
                                                <option value="5+">5+ years</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-primary" /> Identity Documents</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[{ key: "aadhaar", label: "Aadhaar Card" }, { key: "pan", label: "PAN Card" }].map(doc => (
                                            <div key={doc.key} className="group relative border-2 border-dashed border-border rounded-[--radius] p-6 text-center hover:border-primary/50 transition-all bg-muted/10">
                                                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                                                <p className="text-[11px] font-bold text-foreground uppercase">{doc.label}</p>
                                                <input type="file" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange(doc.key, e.target.files[0])} />
                                                {formData[doc.key] && <p className="text-[10px] text-green-500 font-bold mt-2 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> {formData[doc.key].name}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><Landmark className="w-4 h-4 text-primary" /> Banking Details</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Bank Name</label><input type="text" value={formData.bankName} onChange={e => handleChange("bankName", e.target.value)} className="w-full h-10 px-4 bg-muted/30 border border-border rounded-[--radius] text-sm" /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Account Number</label><input type="text" value={formData.accountNumber} onChange={e => handleChange("accountNumber", e.target.value)} className="w-full h-10 px-4 bg-muted/30 border border-border rounded-[--radius] text-sm" /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">IFSC Code</label><input type="text" value={formData.ifsc} onChange={e => handleChange("ifsc", e.target.value)} className="w-full h-10 px-4 bg-muted/30 border border-border rounded-[--radius] text-sm" /></div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><Award className="w-4 h-4 text-primary" /> Professional Certification</h3>
                                    <div className="group relative border-2 border-dashed border-border rounded-[--radius] p-10 text-center hover:border-primary/50 transition-all bg-muted/10">
                                        <Award className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-50 group-hover:text-primary transition-colors" />
                                        <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">Certified Professional Certificate</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">Please upload your beauty or cosmetology certificate</p>
                                        <input type="file" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileChange("certification", e.target.files[0])} />
                                        {formData.certification && <p className="text-[10px] text-green-500 font-bold mt-4 flex items-center justify-center gap-1 bg-green-50 py-2 rounded-sm"><Check className="w-3 h-3" /> {formData.certification.name}</p>}
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-5">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><CheckCircle2 className="w-4 h-4 text-primary" /> Review Application</h3>
                                    <div className="space-y-2 bg-muted/30 p-4 rounded-[--radius] border border-border/50">
                                        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Name</span>
                                            <span className="text-xs font-bold text-foreground">{formData.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Exp.</span>
                                            <span className="text-xs font-bold text-foreground">{formData.experience} Years</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5 border-b border-border/30">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Identity</span>
                                            <span className="text-xs font-bold text-green-600">Verified Docs Attached</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1.5">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Bank</span>
                                            <span className="text-xs font-bold text-foreground">{formData.bankName}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-[--radius] border border-amber-200 flex gap-3 mt-4">
                                        <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <p className="text-[10px] text-amber-700 font-medium leading-relaxed italic">By submitting, you certify all information is accurate. Fraudulent data will result in immediate termination.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Fixed Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border z-50">
                <div className="max-w-xl mx-auto flex gap-3">
                    {step > 1 && (
                        <Button variant="outline" onClick={() => setStep(s => s - 1)} className="h-11 px-6 rounded-[--radius] border-border text-[11px] font-bold"><ChevronLeft className="w-4 h-4 mr-1.5" /> Back</Button>
                    )}
                    <Button onClick={() => step < 5 ? setStep(s => s + 1) : handleSubmit()} disabled={!canProceed()}
                        className="flex-1 h-11 rounded-[--radius] bg-primary text-primary-foreground text-[11px] font-bold shadow-sm">
                        {step === 5 ? "Submit Application" : "Continue"} <ChevronRight className="w-4 h-4 ml-1.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BeauticianRegisterPage;

