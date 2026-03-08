import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Search, X, Camera, Image as ImageIcon } from "lucide-react";
import { useUserModuleData } from "@/modules/user/contexts/UserModuleDataContext";
import { Button } from "@/modules/user/components/ui/button";
import { api } from "@/modules/user/lib/api";
import { toast } from "sonner";

const ImageUpload = ({ label, value, onChange, className = "" }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Create a canvas to resize/compress the image
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimensions to keep localStorage footprint low
                    const MAX_SIZE = 800;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.8 quality
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    onChange(compressedDataUrl);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-xs font-semibold text-muted-foreground uppercase block">{label}</label>
            <div className="flex items-center gap-3">
                <div
                    onClick={() => fileInputRef.current.click()}
                    className="w-16 h-16 rounded-xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:bg-muted transition-colors"
                >
                    {value ? (
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Camera className="w-6 h-6 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current.click()}
                        className="text-[10px] h-7"
                    >
                        {value ? "Change Image" : "Upload Image"}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange("")}
                        className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
};

const UserModuleManagement = () => {
    const {
        categories, addCategory, updateCategory, deleteCategory,
        services, addService, updateService, deleteService,
        serviceTypes, bookingTypeConfig, addServiceType, updateServiceType, deleteServiceType
    } = useUserModuleData();

    const [activeTab, setActiveTab] = useState("parent_categories");
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form state
    const [formData, setFormData] = useState({});

    const handleOpenAdd = () => {
        setEditingItem(null);
        if (activeTab === "parent_categories") {
            setFormData({ label: "", description: "", image: "", color: "from-gray-400 to-gray-500", textColor: "text-gray-600", bgColor: "bg-gray-100" });
        } else if (activeTab === "categories") {
            setFormData({ name: "", gender: "women", bookingType: "instant", serviceType: "skin", image: "", icon: "", advancePercentage: 0 });
        } else {
            setFormData({
                name: "",
                price: 0,
                category: "",
                gender: "women",
                rating: 5,
                reviews: 0,
                description: "",
                image: "",
                includes: "",
                steps: [],
                gallery: [] // New field
            });
        }
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        // Ensure steps and gallery are arrays, and convert includes to string for editing
        setFormData({
            ...item,
            steps: item.steps || [],
            gallery: item.gallery || [],
            includes: Array.isArray(item.includes) ? item.includes.join(', ') : (item.includes || "")
        });
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            if (activeTab === "parent_categories") {
                await api.admin.deleteParent(id);
                deleteServiceType(id);
            } else if (activeTab === "categories") {
                await api.admin.deleteCategory(id);
                deleteCategory(id);
            } else if (activeTab === "services") {
                await api.admin.deleteService(id);
                deleteService(id);
            }
            toast.success("Deleted");
        } catch (e) {
            toast.error(e?.message || "Delete failed");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = { ...formData };

        // Convert includes text back to array if it's a string
        if (typeof payload.includes === 'string') {
            payload.includes = payload.includes.split(',').map(s => s.trim()).filter(s => s !== '');
        }

        const isCreate = !payload.id;
        if (isCreate) payload.id = Date.now().toString();
        try {
            if (activeTab === "parent_categories") {
                if (isCreate) await api.admin.addParent(payload);
                else await api.admin.updateParent(payload.id, payload);
                if (isCreate) addServiceType(payload); else updateServiceType(payload.id, payload);
            } else if (activeTab === "categories") {
                if (isCreate) await api.admin.addCategory(payload);
                else await api.admin.updateCategory(payload.id, payload);
                if (isCreate) addCategory(payload); else updateCategory(payload.id, payload);
            } else if (activeTab === "services") {
                if (isCreate) await api.admin.addService(payload);
                else await api.admin.updateService(payload.id, payload);
                if (isCreate) addService(payload); else updateService(payload.id, payload);
            }
            toast.success(isCreate ? "Created" : "Updated");
        } catch (e) {
            toast.error(e?.message || "Server action failed");
        } finally {
            setIsAddModalOpen(false);
        }
    };

    const getDataForTab = () => {
        if (activeTab === "parent_categories") return serviceTypes || [];
        if (activeTab === "categories") return categories || [];
        return services || [];
    };

    const filteredData = getDataForTab().filter(item =>
        (item.name || item.label || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleGalleryUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    gallery: [...(prev.gallery || []), reader.result]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">App Data Management</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage user module categories, services, and banners directly here.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex bg-muted p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar text-foreground border border-border">
                    {["parent_categories", "categories", "services"].map(tab => (
                        <button key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 sm:px-6 py-2 px-3 whitespace-nowrap rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
                            {tab === "parent_categories" ? "Parent Categories" : tab === "categories" ? "Subcategories" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                    </div>
                    <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground rounded-xl">
                        <Plus className="h-4 w-4 mr-2" /> Add New
                    </Button>
                </div>
            </div>

            <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Image/Icon</th>
                                <th className="px-6 py-4 text-left font-semibold">Name</th>
                                {activeTab !== "parent_categories" && <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">Details</th>}
                                {activeTab === "parent_categories" && <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">Description</th>}
                                {activeTab === "services" && <th className="px-6 py-4 text-left font-semibold hidden sm:table-cell">Price</th>}
                                <th className="px-6 py-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredData.map((item, i) => (
                                <motion.tr key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="hover:bg-accent/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name || item.label} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xl">{item.icon || "📄"}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-sm text-foreground">{item.name || item.label}</p>
                                        {activeTab !== "parent_categories" && (
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${item.gender === 'women' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {item.gender}
                                            </span>
                                        )}
                                    </td>
                                    {activeTab !== "parent_categories" && (
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {activeTab === "categories" ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-muted-foreground">Parent: <span className="font-medium text-foreground capitalize">{serviceTypes?.find(st => st.id === item.serviceType)?.label || item.serviceType || 'Unknown'}</span></span>
                                                    <span className="text-xs text-muted-foreground">Type: <span className="font-medium text-foreground">{bookingTypeConfig?.find(bt => bt.id === item.bookingType)?.label || item.bookingType || 'Unknown'}</span></span>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground capitalize">{item.category}</span>
                                            )}
                                        </td>
                                    )}
                                    {activeTab === "parent_categories" && (
                                        <td className="px-6 py-4 hidden md:table-cell text-xs text-muted-foreground">
                                            {item.description}
                                        </td>
                                    )}
                                    {activeTab === "services" && (
                                        <td className="px-6 py-4 hidden sm:table-cell font-medium text-sm text-foreground">
                                            ₹{item.price}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr><td colSpan={10} className="px-6 py-12 text-center text-muted-foreground text-sm">No {activeTab} found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-background w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                            <h3 className="font-bold text-lg text-foreground">{editingItem ? `Edit ${activeTab === 'categories' ? 'Subcategory' : activeTab === 'parent_categories' ? 'Parent Category' : 'Service'}` : `Add ${activeTab === 'categories' ? 'Subcategory' : activeTab === 'parent_categories' ? 'Parent Category' : 'Service'}`}</h3>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full"><X className="h-5 w-5" /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-4 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
                            {activeTab === "parent_categories" ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Label / Name</label>
                                        <input required type="text" value={formData.label || ''} onChange={e => setFormData({ ...formData, label: e.target.value })}
                                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                                    </div>
                                    <ImageUpload
                                        label="Category Image"
                                        value={formData.image}
                                        onChange={(val) => setFormData({ ...formData, image: val })}
                                    />
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Description</label>
                                        <input required type="text" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 text-foreground">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Name</label>
                                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                                    </div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Gender</label>
                                    <select value={formData.gender || 'women'} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                                        <option value="women">Women</option>
                                        <option value="men">Men</option>
                                    </select>
                                    <ImageUpload
                                        label="Main Image"
                                        value={formData.image}
                                        onChange={(val) => setFormData({ ...formData, image: val })}
                                    />
                                </div>
                            )}

                            {activeTab === "categories" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Parent Category</label>
                                            <select value={formData.serviceType || 'skin'} onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                                                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                                                {serviceTypes?.map(st => (
                                                    <option key={st.id} value={st.id}>{st.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Booking Type</label>
                                            <select value={formData.bookingType || 'instant'} onChange={e => setFormData({ ...formData, bookingType: e.target.value })}
                                                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                                                {bookingTypeConfig?.map(bt => (
                                                    <option key={bt.id} value={bt.id}>{bt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <ImageUpload
                                        label="Icon (Image)"
                                        value={formData.icon}
                                        onChange={(val) => setFormData({ ...formData, icon: val })}
                                    />
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Advance Payment Required (%)</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.advancePercentage || 0}
                                                onChange={e => setFormData({ ...formData, advancePercentage: Number(e.target.value) })}
                                                className="w-24 px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                            />
                                            <span className="text-xs text-muted-foreground">Percentage of total amount (0-100) to be paid during booking.</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "services" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Price (₹)</label>
                                            <input required type="number" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Subcategory</label>
                                            <select required value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground">
                                                <option value="">Select Subcategory</option>
                                                {categories?.filter(c => c.gender === formData.gender).map(c => (
                                                    <option key={c.id + '-' + c.bookingType} value={c.id}>{c.name} ({c.bookingType})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Original Price (₹)</label>
                                            <input type="number" value={formData.originalPrice || ''} onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Duration</label>
                                            <input type="text" value={formData.duration || ''} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="60 min"
                                                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Rating</label>
                                            <input type="number" step="0.1" value={formData.rating || ''} onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                                                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Reviews</label>
                                            <input type="number" value={formData.reviews || ''} onChange={e => setFormData({ ...formData, reviews: Number(e.target.value) })}
                                                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Description</label>
                                        <textarea rows={2} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/50" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Includes (Comma separated)</label>
                                        <input type="text" value={formData.includes || ''}
                                            onChange={e => setFormData({ ...formData, includes: e.target.value })}
                                            placeholder="e.g. Cleansing, Scrub, Mask"
                                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground shadow-sm" />
                                    </div>

                                    {/* Work Gallery Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Work Gallery (Before/After)</label>
                                            <label className="bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded cursor-pointer hover:opacity-90 transition-opacity">
                                                + Upload Photos
                                                <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {formData.gallery?.map((img, idx) => (
                                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                                                    <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }))}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!formData.gallery || formData.gallery.length === 0) && (
                                                <div className="col-span-4 py-4 text-center text-[10px] text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                                    No photos uploaded. Click upload to add before/after work photos.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Service Steps</label>
                                            <Button type="button" size="sm" variant="ghost" className="h-7 text-[10px] text-primary"
                                                onClick={() => setFormData({ ...formData, steps: [...(formData.steps || []), { name: '', description: '', image: '' }] })}>
                                                + Add Step
                                            </Button>
                                        </div>
                                        <div className="space-y-4">
                                            {formData.steps?.map((step, idx) => (
                                                <div key={idx} className="p-3 bg-muted/30 rounded-xl border border-border relative space-y-3">
                                                    <button type="button" onClick={() => setFormData({ ...formData, steps: formData.steps.filter((_, i) => i !== idx) })}
                                                        className="absolute top-2 right-2 text-red-500 hover:text-red-600 transition-colors z-10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>

                                                    <div className="space-y-3">
                                                        <div className="flex flex-col gap-2">
                                                            <input placeholder="Step Name (e.g. Cleansing)" value={step.name || ''} onChange={e => {
                                                                const newSteps = [...formData.steps];
                                                                newSteps[idx] = { ...newSteps[idx], name: e.target.value };
                                                                setFormData({ ...formData, steps: newSteps });
                                                            }} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none" />

                                                            <textarea placeholder="Step Description..." rows={2} value={step.description || ''} onChange={e => {
                                                                const newSteps = [...formData.steps];
                                                                newSteps[idx] = { ...newSteps[idx], description: e.target.value };
                                                                setFormData({ ...formData, steps: newSteps });
                                                            }} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none" />
                                                        </div>

                                                        <ImageUpload
                                                            label={`Step ${idx + 1} Image`}
                                                            value={step.image}
                                                            onChange={(val) => {
                                                                const newSteps = [...formData.steps];
                                                                newSteps[idx] = { ...newSteps[idx], image: val };
                                                                setFormData({ ...formData, steps: newSteps });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {(!formData.steps || formData.steps.length === 0) && (
                                                <div className="py-4 text-center text-[10px] text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                                    No steps added yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3 shrink-0">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">{editingItem ? "Save Changes" : "Create"}</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserModuleManagement;
