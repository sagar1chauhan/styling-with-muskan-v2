import { useEffect, useState } from "react";
import { useProviderAuth } from "../contexts/ProviderAuthContext";
import { api } from "@/modules/user/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/modules/user/components/ui/card";
import { Button } from "@/modules/user/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/user/components/ui/tabs";
import { Badge } from "@/modules/user/components/ui/badge";
import { Wallet, Plus, ArrowDownRight, ArrowUpRight, Ban } from "lucide-react";
import { toast } from "sonner";

export default function LeadCreditManager() {
    const { provider } = useProviderAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const normalizeTxn = (t) => {
        const amount = Number(t.amount || 0);
        const type = String(t.type || t.txnType || "").trim();
        const title = t.meta?.title || t.title || t.desc || t.meta?.desc || "Wallet Activity";
        const date = t.createdAt ? new Date(t.createdAt).toLocaleString() : (t.date || new Date().toLocaleString());
        const mapType = type.toLowerCase();
        let uiType = "Expense";
        if (mapType.includes("recharge") || mapType === "credit") uiType = "Recharge";
        else if (mapType.includes("refund")) uiType = "Refund";
        else if (mapType.includes("penalty")) uiType = "Penalty";
        return {
            id: t._id || t.id || Date.now(),
            type: uiType,
            amount,
            date,
            status: "Success",
            desc: title,
        };
    };
    useEffect(() => {
        let cancel = false;
        const run = async () => {
            if (!provider?.phone) return;
            try {
                const { credits, transactions } = await api.provider.credits(provider.phone);
                if (!cancel) {
                    setBalance(credits || 0);
                    setTransactions(Array.isArray(transactions) ? transactions.map(normalizeTxn) : []);
                }
            } catch {
                // fallback to zero balance, empty transactions
            }
        };
        run();
        return () => { cancel = true; };
    }, [provider?.phone]);

    const refresh = async () => {
        if (!provider?.phone) return;
        try {
            const { credits, transactions } = await api.provider.credits(provider.phone);
            setBalance(credits || 0);
            setTransactions(Array.isArray(transactions) ? transactions.map(normalizeTxn) : []);
        } catch {}
    };

    const handleRecharge = async () => {
        const amt = Number(prompt("Enter recharge amount (INR):", "500"));
        if (!Number.isFinite(amt) || amt <= 0) return;
        try {
            await api.provider.wallet.recharge(amt);
            await refresh();
            toast.success(`Recharge successful: ₹${amt}`);
        } catch (e) {
            toast.error(e?.message || "Recharge failed");
        }
    };

    const handleBuyLead = async () => {
        if (balance < 150) {
            toast.error("Insufficient balance");
            return;
        }
        try {
            await api.provider.wallet.expense(150, "Bought Lead: Bridal Makeup");
            await refresh();
            toast.success("Lead purchase successful");
        } catch (e) {
            toast.error(e?.message || "Expense failed");
        }
    };

    const handleRefund = async () => {
        try {
            await api.provider.wallet.refund(150, "Mock Refund Triggered");
            await refresh();
            toast.success("Refund successful");
        } catch (e) {
            toast.error(e?.message || "Refund failed");
        }
    };

    const filterDocs = (typeStr) => transactions.filter(t => t.type === typeStr);

    const renderTransactionList = (list) => (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-4 scrollbar-hide">
            {list.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No transactions found.</p>
            ) : (
                list.map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full mt-1 ${t.amount > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500"
                                    : t.type === "Penalty" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500"
                                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-500"
                                }`}>
                                {t.amount > 0 ? <ArrowUpRight className="h-4 w-4" /> : t.type === "Penalty" ? <Ban className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{t.desc}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground">{t.date}</p>
                                    <Badge variant="outline" className="text-[10px] py-0 h-4">{t.type}</Badge>
                                </div>
                            </div>
                        </div>
                        <div className={`font-bold ${t.amount > 0 ? "text-green-600" : t.type === "Penalty" ? "text-red-600" : ""
                            }`}>
                            {t.amount > 0 ? "+" : ""}{t.amount}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="flex flex-1 w-full flex-col gap-6 pt-4 md:pt-0">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Credits & Leads</h1>
                <p className="text-muted-foreground">Manage your wallet balance and review transactions.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                <Card className="h-max bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-purple-600" />
                            Wallet Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold tracking-tight text-purple-950 dark:text-purple-50">
                            {balance} <span className="text-base font-normal text-muted-foreground">CR</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">1 CR = ₹1.00</p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleRecharge}>
                            <Plus className="mr-2 h-4 w-4" /> Recharge Credits
                        </Button>

                        <div className="w-full flex gap-2 mt-4 pt-4 border-t">
                            <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleBuyLead}>
                                Test Buy
                            </Button>
                            <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleRefund}>
                                Test Refund
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>A complete log of your wallet activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="grid w-full grid-cols-5 mb-4 max-w-[400px]">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="in">Recharges</TabsTrigger>
                                <TabsTrigger value="out">Expenses</TabsTrigger>
                                <TabsTrigger value="ref">Refunds</TabsTrigger>
                                <TabsTrigger value="pen">Penalties</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all">{renderTransactionList(transactions)}</TabsContent>
                            <TabsContent value="in">{renderTransactionList(filterDocs("Recharge"))}</TabsContent>
                            <TabsContent value="out">{renderTransactionList(filterDocs("Expense"))}</TabsContent>
                            <TabsContent value="ref">{renderTransactionList(filterDocs("Refund"))}</TabsContent>
                            <TabsContent value="pen">{renderTransactionList(filterDocs("Penalty"))}</TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
