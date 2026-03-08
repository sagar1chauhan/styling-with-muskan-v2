import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Navigation, Home, Briefcase, Plus } from "lucide-react";
import { useAuth } from "@/modules/user/contexts/AuthContext";
import { Button } from "@/modules/user/components/ui/button";

const AddressModal = ({ isOpen, onClose, onSave, initialAddress }) => {
    const { updateAddress, updateExistingAddress } = useAuth();
    const [address, setAddress] = useState({
        houseNo: "",
        landmark: "",
        area: "",
        type: "home",
        _id: undefined
    });
    const [isLocating, setIsLocating] = useState(false);

    React.useEffect(() => {
        if (initialAddress) {
            setAddress({
                houseNo: initialAddress.houseNo || "",
                landmark: initialAddress.landmark || "",
                area: initialAddress.area || "",
                type: initialAddress.type || "home",
                _id: initialAddress._id || initialAddress.id
            });
        } else {
            setAddress({ houseNo: "", landmark: "", area: "", type: "home", _id: undefined });
        }
    }, [initialAddress, isOpen]);

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Mocking reverse geocoding with a random valid-looking area
                setTimeout(() => {
                    setAddress(prev => ({ ...prev, area: "Sector 15, Noida", lat: latitude, lng: longitude }));
                    setIsLocating(false);
                }, 1500);
            },
            (error) => {
                setIsLocating(false);
                alert("Unable to retrieve your location. Please enter manually.");
                console.error(error);
            }
        );
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (address.houseNo && address.area) {
            if (address._id) {
                updateExistingAddress(address._id, {
                    houseNo: address.houseNo,
                    area: address.area,
                    landmark: address.landmark,
                    type: address.type,
                    lat: address.lat,
                    lng: address.lng
                });
            } else {
                updateAddress({
                    houseNo: address.houseNo,
                    area: address.area,
                    landmark: address.landmark,
                    type: address.type,
                    lat: address.lat,
                    lng: address.lng
                });
            }
            onSave?.();
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pt-10 sm:p-8 md:p-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 10 }}
                        className="relative w-full max-w-lg bg-background rounded-[32px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto"
                    >
                        {/* Fixed Header */}
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-background z-10 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold font-display uppercase tracking-tight">Select Delivery Location</h2>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Where should we deliver?</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar p-6 sm:p-8">
                            <form id="address-form" onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">House / Flat No.*</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        required
                                        value={address.houseNo}
                                        onChange={e => setAddress({ ...address, houseNo: e.target.value })}
                                        placeholder="e.g. B-12, 4th Floor"
                                        className="w-full h-12 px-4 rounded-xl bg-accent border-none text-base focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Landmark (Optional)</label>
                                    <input
                                        type="text"
                                        value={address.landmark}
                                        onChange={e => setAddress({ ...address, landmark: e.target.value })}
                                        placeholder="e.g. Near Central Park"
                                        className="w-full h-12 px-4 rounded-xl bg-accent border-none text-base focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Area / Locality*</label>
                                    <div className="relative group">
                                        <Navigation className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isLocating ? 'text-primary animate-pulse' : 'text-primary'}`} />
                                        <input
                                            type="text"
                                            required
                                            value={address.area}
                                            onChange={e => setAddress({ ...address, area: e.target.value })}
                                            placeholder="Select your area"
                                            className="w-full h-12 pl-11 pr-32 rounded-xl bg-accent border-none text-base focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGetCurrentLocation}
                                            disabled={isLocating}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isLocating ? "LOCATING..." : "USE CURRENT"}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-2">
                                    {[
                                        { id: 'home', icon: Home, label: 'Home' },
                                        { id: 'work', icon: Briefcase, label: 'Work' },
                                        { id: 'other', icon: MapPin, label: 'Other' }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setAddress({ ...address, type: type.id })}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${address.type === type.id ? 'border-primary bg-primary/5 text-primary' : 'border-border grayscale opacity-60'}`}
                                        >
                                            <type.icon className="w-5 h-5" />
                                            <span className="text-[10px] font-bold uppercase">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </form>
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-6 bg-background border-t border-border shrink-0">
                            <Button
                                type="submit"
                                form="address-form"
                                disabled={isLocating}
                                className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 border-none bg-black text-white hover:bg-black/90"
                            >
                                CONFIRM LOCATION
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddressModal;
