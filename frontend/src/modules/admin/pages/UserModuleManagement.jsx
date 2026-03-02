import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import { useUserModuleData } from "@/modules/user/contexts/UserModuleDataContext";
import { Button } from "@/modules/user/components/ui/button";

const UserModuleManagement = () => {
    const {
        categories, addCategory, updateCategory, deleteCategory,
        services, addService, updateService, deleteService
    } = useUserModuleData();

    const [activeTab, setActiveTab] = useState("categories");
    const [searchTerm, setSearchTerm] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form state
    const [formData, setFormData] = useState({});

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData(activeTab === "categories" ? { gender: "women", bookingType: "instant" } : { gender: "women", rating: 5, reviews: 0 });
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormData(item);
        setIsAddModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        if (activeTab === "categories") deleteCategory(id);
        else if (activeTab === "services") deleteService(id);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (!payload.id) {
            payload.id = Date.now().toString();
            if (activeTab === "categories") addCategory(payload);
            else if (activeTab === "services") addService(payload);
        } else {
            if (activeTab === "categories") updateCategory(payload.id, payload);
            else if (activeTab === "services") updateService(payload.id, payload);
        }
        setIsAddModalOpen(false);
    };

    const filteredData = (activeTab === "categories" ? categories : services).filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">App Data Management</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage user module categories, services, and banners directly here.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex bg-muted p-1 rounded-xl w-full sm:w-auto">
                    {["categories", "services"].map(tab => (
                        <button key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
                                <th className="px-6 py-4 text-left font-semibold hidden md:table-cell">Gender</th>
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
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xl">{item.icon || "📄"}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-sm text-foreground">{item.name}</p>
                                        <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{item.category || item.serviceType}</p>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.gender === 'women' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {item.gender}
                                        </span>
                                    </td>
                                    {activeTab === "services" && (
                                        <td className="px-6 py-4 hidden sm:table-cell font-medium text-sm">
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
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">No {activeTab} found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Basic Modal for Add/Edit */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-background w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-bold text-lg">{editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Name</label>
                                <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Gender</label>
                                    <select value={formData.gender || 'women'} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                        <option value="women">Women</option>
                                        <option value="men">Men</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Image URL</label>
                                    <input type="text" value={formData.image || ''} onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                            </div>

                            {activeTab === "categories" ? (
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Icon (Emoji)</label>
                                    <input type="text" value={formData.icon || ''} onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Price (₹)</label>
                                        <input required type="number" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Category ID</label>
                                        <input required type="text" value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                </div>
                            )}

                            {activeTab === "services" && (
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Description</label>
                                    <textarea rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-primary text-primary-foreground">{editingItem ? "Save Changes" : "Create"}</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserModuleManagement;
