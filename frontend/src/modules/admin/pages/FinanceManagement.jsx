import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Percent, IndianRupee, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/modules/user/components/ui/card";
import { Button } from "@/modules/user/components/ui/button";
import { Input } from "@/modules/user/components/ui/input";
import { Label } from "@/modules/user/components/ui/label";
import { Slider } from "@/modules/user/components/ui/slider";
import { useAdminAuth } from "@/modules/admin/contexts/AdminAuthContext";

export default function FinanceManagement() {
    const { getCommissionSettings, updateCommissionSettings } = useAdminAuth();
    const [settings, setSettings] = useState(getCommissionSettings());
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        updateCommissionSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                    <Wallet className="h-7 w-7 text-primary" /> Commission & Payouts
                </h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">Configure platform commission and payout rules</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-border/50 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2"><Percent className="h-5 w-5 text-primary" /> Commission Rate</CardTitle>
                        <CardDescription>Percentage charged on each completed booking</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold">Platform Commission</Label>
                                <span className="text-2xl font-black text-primary">{settings.rate}%</span>
                            </div>
                            <Slider value={[settings.rate]} onValueChange={([v]) => setSettings(prev => ({ ...prev, rate: v }))} min={5} max={30} step={1} className="w-full" />
                            <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                                <span>5%</span><span>30%</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-border/50">
                            <Label className="text-sm font-bold">Minimum Payout Amount</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="number" value={settings.minPayout} onChange={e => setSettings(prev => ({ ...prev, minPayout: parseInt(e.target.value) || 0 }))} className="pl-9 h-11 rounded-xl bg-muted/30 border-border/50" />
                            </div>
                            <p className="text-[10px] text-muted-foreground">Minimum amount required for SP withdrawal</p>
                        </div>

                        <Button onClick={handleSave} className="w-full h-11 rounded-xl font-bold gap-2">
                            {saved ? <><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div> Saved!</> : <><Save className="h-4 w-4" /> Save Settings</>}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
