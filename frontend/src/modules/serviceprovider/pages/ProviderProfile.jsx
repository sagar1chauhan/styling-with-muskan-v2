import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Calendar,
    History,
    Map,
    Contact,
    Wallet,
    Banknote,
    Shield,
    GraduationCap,
    UserPlus,
    ShoppingBag,
    ChevronRight,
    Star,
    Edit3,
    LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/user/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/modules/user/components/ui/dialog";
import { Input } from "@/modules/user/components/ui/input";
import { Label } from "@/modules/user/components/ui/label";
import { Button } from "@/modules/user/components/ui/button";

const menuItems = [
    { icon: Calendar, label: "Calendar", path: "/provider/availability" },
    { icon: History, label: "Job history", path: "/provider/history" },
    { icon: Map, label: "My Hub", path: "/provider/admin" },
    { icon: Contact, label: "Share visiting card", path: "/provider/profile" },
    { icon: Wallet, label: "Credits", path: "/provider/credits" },
    { icon: Banknote, label: "Loans", path: "/provider/admin" },
    { icon: Shield, label: "Insurance", path: "/provider/admin" },
    { icon: GraduationCap, label: "Training", path: "/provider/training" },
    { icon: UserPlus, label: "Invite a friend to SWM", path: "/provider/profile" },
    { icon: ShoppingBag, label: "SWM shop", path: "/provider/admin" },
];

export default function ProviderProfile() {
    const navigate = useNavigate();
    const [name, setName] = useState("Muskan Poswal");
    const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=240");
    const [editName, setEditName] = useState(name);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fileInputRef = useRef(null);

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        setName(editName);
        setIsDialogOpen(false);
    };

    return (
        <div className="flex flex-1 w-full flex-col bg-white -m-4 md:m-0 min-h-screen">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
            />

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
                        {/* Edit Profile Dialog */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <button className="text-sm font-bold border-b-2 border-black pb-0.5">Profile</button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700">
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="text-sm font-bold border-b-2 border-black pb-0.5"
                        >
                            Change photo
                        </button>
                    </div>
                </div>

                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                    <Avatar className="h-28 w-24 rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden relative">
                        <AvatarImage src={profileImage} className="object-cover" />
                        <AvatarFallback className="rounded-2xl">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Edit3 className="text-white h-6 w-6" />
                        </div>
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
                                <Icon className="h-6 w-6 text-gray-700 stroke-[1.5px]" />
                                <span className="text-[17px] font-semibold text-gray-800 tracking-tight">{item.label}</span>
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
                <img src="/logo.png" alt="Styling with Muskan" className="h-10 object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
        </div>
    );
}
