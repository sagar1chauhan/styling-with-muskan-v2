import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/modules/user/lib/api";
import { SERVICE_TYPES as FALLBACK_SERVICE_TYPES, BOOKING_TYPE_CONFIG as FALLBACK_BOOKING_TYPES, categories as FALLBACK_CATEGORIES, services as FALLBACK_SERVICES, banners as FALLBACK_BANNERS, mockProviders as FALLBACK_PROVIDERS } from "@/modules/user/data/services";

const UserModuleDataContext = createContext(null);

export const UserModuleDataProvider = ({ children }) => {
    const [serviceTypes, setServiceTypes] = useState([]);

    const [bookingTypeConfig, setBookingTypeConfig] = useState([]);

    const [categories, setCategories] = useState([]);

    const [services, setServices] = useState([]);

    const [banners, setBanners] = useState({ women: [], men: [] });

    const [providers, setProviders] = useState([]);

    const [officeSettings, setOfficeSettings] = useState({ startTime: "09:00", endTime: "21:00", autoAssign: true, notificationMessage: "Our pros are sleeping. Service starts at 9:00 AM" });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [st, bt, cats, srv, ban, prov, off] = await Promise.all([
                    api.content.serviceTypes(),
                    api.content.bookingTypes(),
                    api.content.categories(),
                    api.content.services(),
                    api.content.banners(),
                    api.content.providers(),
                    api.content.officeSettings(),
                ]);
                if (cancelled) return;
                setServiceTypes(st.data || []);
                setBookingTypeConfig(bt.data || []);
                setCategories(cats.data || []);
                setServices(srv.data || []);
                setBanners(ban.data || { women: [], men: [] });
                setProviders(prov.data || []);
                setOfficeSettings(off.data || officeSettings);
            } catch (e) {
                setServiceTypes(FALLBACK_SERVICE_TYPES);
                setBookingTypeConfig(FALLBACK_BOOKING_TYPES);
                setCategories(FALLBACK_CATEGORIES);
                setServices(FALLBACK_SERVICES);
                setBanners(FALLBACK_BANNERS);
                setProviders(FALLBACK_PROVIDERS);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // CRUD operations
    const addCategory = (category) => setCategories(prev => [...prev, category]);
    const updateCategory = (id, updated) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));

    const addService = (service) => setServices(prev => [...prev, service]);
    const updateService = (id, updated) => setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    const deleteService = (id) => setServices(prev => prev.filter(s => s.id !== id));

    const addBanner = (gender, banner) => setBanners(prev => ({
        ...prev,
        [gender]: [...(prev[gender] || []), banner]
    }));
    const updateBanner = (gender, id, updated) => setBanners(prev => ({
        ...prev,
        [gender]: prev[gender].map(b => b.id === id ? { ...b, ...updated } : b)
    }));
    const deleteBanner = (gender, id) => setBanners(prev => ({
        ...prev,
        [gender]: prev[gender].filter(b => b.id !== id)
    }));

    // For Service Types
    const addServiceType = (type) => setServiceTypes(prev => [...prev, type]);
    const updateServiceType = (id, updated) => setServiceTypes(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    const deleteServiceType = (id) => setServiceTypes(prev => prev.filter(t => t.id !== id));

    const value = {
        serviceTypes,
        bookingTypeConfig,
        categories,
        services,
        banners,
        providers,
        officeSettings,
        setOfficeSettings,
        // Category actions
        addCategory,
        updateCategory,
        deleteCategory,
        // Service actions
        addService,
        updateService,
        deleteService,
        // Banner actions
        addBanner,
        updateBanner,
        deleteBanner,
        // Service Types actions
        addServiceType,
        updateServiceType,
        deleteServiceType,
    };

    return (
        <UserModuleDataContext.Provider value={value}>
            {children}
        </UserModuleDataContext.Provider>
    );
};

export const useUserModuleData = () => {
    const context = useContext(UserModuleDataContext);
    if (!context) {
        throw new Error("useUserModuleData must be used within a UserModuleDataProvider");
    }
    return context;
};
