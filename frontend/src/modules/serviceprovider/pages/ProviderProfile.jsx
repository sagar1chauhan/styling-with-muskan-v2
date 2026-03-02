import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Calendar,
    Map,
    Wallet,
    Shield,
    GraduationCap,
    UserPlus,
    ShoppingBag,
    ChevronRight,
    Star,
    LogOut,
    LifeBuoy,
    AlertTriangle,
    RefreshCw,
    MessageSquare,
    Trophy,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/user/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/modules/user/components/ui/dialog";
import { Button } from "@/modules/user/components/ui/button";

const menuItems = [
    { icon: Trophy, label: "Weekly performance", path: "/provider/performance" },
    { icon: Calendar, label: "Calendar", path: "/provider/availability" },
    { icon: Map, label: "My Hub", path: "/provider/hub" },
    { icon: Wallet, label: "Credits", path: "/provider/credits" },
    { icon: Shield, label: "Insurance", path: "/provider/admin" },
    { icon: GraduationCap, label: "Training", path: "/provider/training" },
    { icon: UserPlus, label: "Invite a friend with SWM", path: "/provider/profile" },
    { icon: ShoppingBag, label: "SWM shop", path: "/provider/shop" },
    { icon: LifeBuoy, label: "SWM support", path: "/provider/support" },
    { icon: AlertTriangle, label: "SOS", path: "/provider/sos", color: "text-red-500 font-bold" },
    { icon: MessageSquare, label: "Raise a ticket", path: "/provider/tickets" },
    { icon: RefreshCw, label: "Check for updates", path: "#", version: "v2.1.0" },
];

export default function ProviderProfile() {
    const navigate = useNavigate();
    const [name] = useState("Muskan Poswal");
    const [profileImage] = useState("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=240");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Mock registration data
    const providerDetails = {
        email: "muskan.poswal@swm.com",
        phone: "+91 98765 43210",
        city: "New Delhi",
        category: "Beautician - Hair & Makeup",
        joiningDate: "Jan 12, 2024",
        experience: "4+ Years"
    };

    return (
        <div className="flex flex-1 w-full flex-col bg-white -m-4 md:m-0 min-h-screen">
            {/* Top Header Section */}
            <div className="p-6 pt-10 flex justify-between items-start border-b border-gray-100">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{name}</h1>
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-600">
                            <Star className="h-4 w-4 fill-gray-600" />
                            <span>4.63</span>
                        </div>
                    </div>

                    <div className="flex gap-6 pt-2">
                        {/* Profile Details Dialog */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <button className="text-sm font-bold border-b-2 border-black pb-0.5">Profile Details</button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl border-none">
                                <DialogHeader className="p-6 bg-slate-900 text-white">
                                    <DialogTitle className="text-xl font-bold">Registration Details</DialogTitle>
                                </DialogHeader>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Full Name</p>
                                                <p className="text-[17px] font-semibold text-slate-900">{name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email Address</p>
                                                <p className="text-[17px] font-semibold text-slate-900">{providerDetails.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Phone Number</p>
                                                <p className="text-[17px] font-semibold text-slate-900">{providerDetails.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">City</p>
                                                <p className="text-[17px] font-semibold text-slate-900">{providerDetails.city}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Category</p>
                                                <p className="text-[17px] font-semibold text-slate-900">{providerDetails.category}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Joined On</p>
                                                <p className="text-sm font-bold text-slate-700">{providerDetails.joiningDate}</p>
                                            </div>
                                            <div className="h-px w-8 bg-slate-200" />
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Experience</p>
                                                <p className="text-sm font-bold text-slate-700">{providerDetails.experience}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 flex justify-center">
                                    <Button onClick={() => setIsDialogOpen(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold">
                                        Close Details
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="relative group">
                    <Avatar className="h-28 w-24 rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden relative">
                        <AvatarImage src={profileImage} className="object-cover" />
                        <AvatarFallback className="rounded-2xl">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Menu Options List */}
            <div className="flex-1 bg-white">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className="flex items-center justify-between p-5 border-b border-gray-50 active:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <Icon className={`h-6 w-6 ${item.color?.includes('text-red') ? 'text-red-500' : 'text-gray-700'} stroke-[1.5px]`} />
                                <div className="flex flex-col">
                                    <span className={`text-[17px] font-semibold tracking-tight ${item.color || "text-gray-800"}`}>{item.label}</span>
                                    {item.version && <span className="text-[11px] font-bold text-gray-400 -mt-1">{item.version}</span>}
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </Link>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={() => navigate("/provider/login")}
                    className="w-full flex items-center justify-between p-5 border-b border-gray-50 active:bg-red-50 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-red-50 p-2 rounded-lg group-active:bg-red-100 transition-colors">
                            <LogOut className="h-5 w-5 text-red-600 stroke-[2px]" />
                        </div>
                        <span className="text-[17px] font-bold text-red-600 tracking-tight">Logout</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-red-400" />
                </button>
            </div>

            {/* Footer Branding Area */}
            <div className="p-8 pb-12 flex justify-center opacity-20 grayscale pointer-events-none">
                <img src="/logo1.png" alt="Styling with Muskan" className="h-16 w-16 rounded-full object-cover shadow-lg border-2 border-primary/20" onError={(e) => e.target.style.display = 'none'} />
            </div>
        </div>
    );
}
