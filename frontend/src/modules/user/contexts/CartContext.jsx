import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // We cannot easily use useUserModuleData here if CartProvider is inside it, but we can fallback to localStorage or just assume it's initialized. 
    // Wait, better to not initialize categories statically, but parse from context or simply let the components do it.
    // Actually, `categories` is only used inside functions here. I will just read from localStorage dynamically or let the components supply the category type if possible.
    // For now, let's just use localStorage "swm_categories" directly here since this is context.

    // helper to get categories
    const getCategories = () => {
        const saved = localStorage.getItem("swm_categories");
        return saved ? JSON.parse(saved) : [];
    };

    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                const items = JSON.parse(savedCart);
                return items.map(item => {
                    const cats = getCategories();
                    const cat = item.category ? cats.find(c => c.id === item.category) : null;
                    const type = cat?.serviceType || item.serviceType || "other";
                    return { ...item, serviceType: type };
                });
            } catch (e) {
                return [];
            }
        }
        return [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(() => {
        const savedSlot = localStorage.getItem("selectedSlot");
        return savedSlot ? JSON.parse(savedSlot) : null;
    });
    const [bookingType, setBookingType] = useState(() => {
        return localStorage.getItem("bookingType") || "instant";
    });


    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem("selectedSlot", JSON.stringify(selectedSlot));
    }, [selectedSlot]);

    useEffect(() => {
        localStorage.setItem("bookingType", bookingType);
    }, [bookingType]);



    const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    const totalPrice = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    const totalSavings = cartItems.reduce((total, item) => {
        if (item.originalPrice) {
            return total + ((item.originalPrice - item.price) * (item.quantity || 1));
        }
        return total;
    }, 0);

    const getGroupedItems = () => {
        const groups = {};
        const groupLabels = { skin: "🧴 Skin Care", hair: "💇 Hair Services", makeup: "💄 Makeup & More" };
        const groupImages = {
            skin: "/skin_service_banner_1772177557335.png",
            hair: "/hair_service_banner_1772177572229.png",
            makeup: "/makeup_service_banner_1772177590551.png"
        };

        cartItems.forEach(item => {
            const cats = getCategories();
            const cat = item.category ? cats.find(c => c.id === item.category) : null;
            const type = cat?.serviceType || item.serviceType || "other";
            if (!groups[type]) {
                groups[type] = {
                    id: type,
                    label: groupLabels[type] || "Other Services",
                    image: groupImages[type] || "",
                    items: [],
                    subtotal: 0,
                    itemCount: 0
                };
            }
            groups[type].items.push(item);
            groups[type].subtotal += item.price * (item.quantity || 1);
            groups[type].itemCount += (item.quantity || 1);
        });
        return groups;
    };

    const addToCart = (service) => {
        const cats = getCategories();
        const cat = service.category ? cats.find(c => c.id === service.category) : null;
        const mappedServiceType = cat?.serviceType || service.serviceType || "other";
        const serviceWithType = { ...service, serviceType: mappedServiceType };
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === serviceWithType.id && item.serviceType === serviceWithType.serviceType);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === serviceWithType.id && item.serviceType === serviceWithType.serviceType
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                );
            }
            return [...prevItems, { ...serviceWithType, quantity: 1 }];
        });
    };

    const updateQuantity = (serviceId, amount) => {
        setCartItems((prevItems) => {
            return prevItems.map((item) => {
                if (item.id === serviceId) {
                    const newQuantity = (item.quantity || 1) + amount;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean);
        });
    };

    const clearGroup = (typeId) => {
        setCartItems(prev => prev.filter(item => item.serviceType !== typeId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const [activeCheckoutType, setActiveCheckoutType] = useState(null);
    const [isFloatingSummaryOpen, setIsFloatingSummaryOpen] = useState(false);

    useEffect(() => {
        if (isCartOpen) {
            setIsFloatingSummaryOpen(false);
        }
    }, [isCartOpen]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                totalItems,
                totalPrice,
                totalSavings,
                isCartOpen,
                setIsCartOpen,
                isFloatingSummaryOpen,
                setIsFloatingSummaryOpen,
                activeCheckoutType,
                setActiveCheckoutType,
                selectedSlot,
                setSelectedSlot,
                bookingType,
                setBookingType,
                addToCart,
                updateQuantity,
                clearCart,
                clearGroup,
                getGroupedItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
