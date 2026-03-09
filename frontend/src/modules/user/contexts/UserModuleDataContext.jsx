import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/modules/user/lib/api";
import { SERVICE_TYPES as FALLBACK_SERVICE_TYPES, BOOKING_TYPE_CONFIG as FALLBACK_BOOKING_TYPES, categories as FALLBACK_CATEGORIES, services as FALLBACK_SERVICES, banners as FALLBACK_BANNERS, mockProviders as FALLBACK_PROVIDERS } from "@/modules/user/data/services";
import {
    SERVICE_TYPES as initialServiceTypes,
    BOOKING_TYPE_CONFIG as initialBookingTypeConfig,
    categories as initialCategories,
    services as initialServices,
    banners as initialBanners,
    mockProviders as initialProviders,
    initialSpotlights,
    initialGallery,
    initialTestimonials
} from "../data/services";

const UserModuleDataContext = createContext(null);

export const UserModuleDataProvider = ({ children }) => {
    const [serviceTypes, setServiceTypes] = useState([]);
    // Initialize state from localStorage or fallback to static data
    const [serviceTypes, setServiceTypes] = useState(() => {
        const saved = localStorage.getItem("swm_serviceTypes");
        return saved ? JSON.parse(saved) : initialServiceTypes;
    });

    const [bookingTypeConfig, setBookingTypeConfig] = useState(() => {
        const saved = localStorage.getItem("swm_bookingTypeConfig");
        let parsed = saved ? JSON.parse(saved) : initialBookingTypeConfig;
        
        // Migration: Ensure 'Instant Booking' is replaced with 'Booked' consistently
        parsed = parsed.map(config => {
            if (config.id === "instant" && (config.label === "Instant Booking" || config.label === "Instant")) {
                return { ...config, label: "Booked" };
            }
            return config;
        });
        
        return parsed;
    });

    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem("swm_categories");
        return saved ? JSON.parse(saved) : initialCategories;
    });

    const [services, setServices] = useState(() => {
        const saved = localStorage.getItem("swm_services");
        return saved ? JSON.parse(saved) : initialServices;
    });

    const [banners, setBanners] = useState(() => {
        const saved = localStorage.getItem("swm_banners");
        return saved ? JSON.parse(saved) : initialBanners;
    });

    const [providers, setProviders] = useState(() => {
        const saved = localStorage.getItem("swm_providers");
        return saved ? JSON.parse(saved) : initialProviders;
    });

    const [officeSettings, setOfficeSettings] = useState(() => {
        const saved = localStorage.getItem("swm_officeSettings");
        return saved ? JSON.parse(saved) : { startTime: "09:00", endTime: "21:00", autoAssign: true, notificationMessage: "Our pros are sleeping. Service starts at 9:00 AM" };
    });

    // New Site Content States
    const [spotlights, setSpotlights] = useState(() => {
        const saved = localStorage.getItem("swm_spotlights");
        return saved ? JSON.parse(saved) : initialSpotlights;
    });

    const [gallery, setGallery] = useState(() => {
        const saved = localStorage.getItem("swm_gallery");
        return saved ? JSON.parse(saved) : initialGallery;
    });

    const [testimonials, setTestimonials] = useState(() => {
        const saved = localStorage.getItem("swm_testimonials");
        return saved ? JSON.parse(saved) : initialTestimonials;
    });

    // Safe Save Helper
    const safeSave = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Storage failed for ${key}`, e);
        }
    }

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

    useEffect(() => {
        safeSave("swm_spotlights", spotlights);
    }, [spotlights]);

    useEffect(() => {
        safeSave("swm_gallery", gallery);
    }, [gallery]);

    useEffect(() => {
        safeSave("swm_testimonials", testimonials);
    }, [testimonials]);

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

    // Site Content CRUD
    const addSpotlight = (item) => setSpotlights(prev => [...prev, item]);
    const updateSpotlight = (id, updated) => setSpotlights(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    const deleteSpotlight = (id) => setSpotlights(prev => prev.filter(s => s.id !== id));

    const addGallery = (item) => setGallery(prev => [...prev, item]);
    const updateGallery = (id, updated) => setGallery(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
    const deleteGallery = (id) => setGallery(prev => prev.filter(g => g.id !== id));

    const addTestimonial = (item) => setTestimonials(prev => [...prev, item]);
    const updateTestimonial = (id, updated) => setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    const deleteTestimonial = (id) => setTestimonials(prev => prev.filter(t => t.id !== id));

    const value = {
        serviceTypes,
        bookingTypeConfig,
        categories,
        services,
        banners,
        providers,
        officeSettings,
        setOfficeSettings,
        spotlights,
        gallery,
        testimonials,
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
        // Site Content actions
        addSpotlight,
        updateSpotlight,
        deleteSpotlight,
        addGallery,
        updateGallery,
        deleteGallery,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        // Booking Type Config actions
        updateBookingTypeConfig: (updatedConfig) => setBookingTypeConfig(updatedConfig),
        checkAvailability: (item, userCity, selectedDate = null, selectedTime = null) => {
            if (!item) return true;
            // 1. Zone/City check
            if (item.zones && item.zones.length > 0 && userCity) {
                if (!item.zones.includes(userCity)) return false;
            }

            // 2. Disabled Dates/Times check
            if (item.disabledDates && item.disabledDates.length > 0) {
                const checkDate = selectedDate || new Date().toISOString().split('T')[0];
                const checkTime = selectedTime || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                const isBlocked = item.disabledDates.some(block => {
                    if (block.date !== checkDate) return false;
                    if (block.fullDay) return true;

                    // Partial time check
                    return checkTime >= block.startTime && checkTime <= block.endTime;
                });

                if (isBlocked) return false;
            }

            return true;
        }
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
