import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const galleryImages = [
    { id: 1, image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop", title: "Luxury Suite" },
    { id: 2, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop", title: "Makeup Studio" },
    { id: 3, image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=400&fit=crop", title: "Private Spa Area" },
    { id: 4, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=400&fit=crop", title: "Relaxation Lounge" },
    { id: 5, image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=400&fit=crop", title: "Style Zone" },
];

const OurGallery = () => {
    const scrollRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                const maxScroll = scrollWidth - clientWidth;

                if (scrollLeft >= maxScroll - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    scrollRef.current.scrollTo({ left: scrollLeft + 300, behavior: "smooth" });
                }
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <section className="py-12 px-4 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black font-display uppercase tracking-[0.2em] text-primary">Our Gallery</h2>
                    <div className="h-1 w-20 bg-primary/20 mx-auto mt-2 rounded-full" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 mt-3 tracking-widest">A glimpse of our premium workspace</p>
                </div>

                <div
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto hide-scrollbar gap-5 pb-6 snap-x"
                    >
                        {galleryImages.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                className="flex-shrink-0 w-[240px] md:w-[350px] aspect-[4/3] relative rounded-[2.5rem] overflow-hidden snap-center shadow-2xl group cursor-pointer"
                            >
                                <img
                                    src={item.image}
                                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                                    alt={item.title}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                                        <Maximize2 className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-8 right-8 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <h3 className="text-white font-black text-lg drop-shadow-lg">{item.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Aesthetic footer info */}
                <div className="flex justify-center gap-2 mt-4">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 2 ? 'bg-primary' : 'bg-primary/20'}`} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OurGallery;
