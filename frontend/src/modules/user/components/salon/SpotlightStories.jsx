import { motion } from "framer-motion";
import { Play, Zap, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const spotlightStories = [
    {
        id: 1,
        title: "Home Makeup Art",
        category: "Makeup",
        video: "https://assets.mixkit.co/videos/preview/mixkit-makeup-artist-applying-eyeshadow-on-a-customer-34167-large.mp4",
        poster: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop"
    },
    {
        id: 2,
        title: "Hair Transformation",
        category: "Hair",
        video: "https://assets.mixkit.co/videos/preview/mixkit-stylist-combing-a-customer-s-hair-34162-large.mp4",
        poster: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=600&fit=crop"
    },
    {
        id: 3,
        title: "Skin Rejuvenation",
        category: "Skin",
        video: "https://assets.mixkit.co/videos/preview/mixkit-beautician-performing-a-facial-treatment-on-a-customer-34164-large.mp4",
        poster: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=600&fit=crop"
    },
    {
        id: 4,
        title: "Bridal Perfection",
        category: "Bridal",
        video: "https://assets.mixkit.co/videos/preview/mixkit-hair-stylist-spraying-hair-of-a-customer-34163-large.mp4",
        poster: "https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=400&h=600&fit=crop"
    },
    {
        id: 5,
        title: "Classic Styling",
        category: "Hair",
        video: "https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-while-beautician-applies-a-face-mask-34158-large.mp4",
        poster: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=600&fit=crop"
    },
];

const SpotlightStories = () => {
    const scrollRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [muted, setMuted] = useState(true);

    // Optimized Auto Horizontal Scroll Logic
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isHovered) return;

        const interval = setInterval(() => {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;

            // Check if we reached the end (with small buffer)
            if (scrollLeft + clientWidth >= scrollWidth - 50) {
                scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                // Scroll by one card width approximately
                scrollContainer.scrollTo({
                    left: scrollLeft + (clientWidth > 600 ? 300 : 220),
                    behavior: "smooth"
                });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isHovered]);

    // Force Play on Mount to ensure auto-start
    useEffect(() => {
        const videos = document.querySelectorAll('.spotlight-video');
        videos.forEach(video => {
            video.muted = true;
            video.play().catch(e => console.log("Autoplay blocked", e));
        });
    }, []);

    return (
        <section className="py-12 px-4 overflow-hidden bg-accent/20 border-y border-border/50">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 px-1">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                            <span className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em]">Spotlight</span>
                        </div>
                        <h2 className="text-xl font-black font-display uppercase tracking-widest text-foreground">Spotlight Stories</h2>
                    </div>

                    <button
                        onClick={() => setMuted(!muted)}
                        className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center border border-border shadow-sm hover:bg-accent transition-colors z-10"
                    >
                        {muted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
                    </button>
                </div>

                <div
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onTouchStart={() => setIsHovered(true)}
                    onTouchEnd={() => setIsHovered(false)}
                >
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto hide-scrollbar gap-5 pb-6 snap-x snap-mandatory scroll-smooth"
                    >
                        {spotlightStories.map((story) => (
                            <motion.div
                                key={story.id}
                                whileHover={{ scale: 1.02 }}
                                className="flex-shrink-0 w-[200px] md:w-[240px] h-[320px] md:h-[400px] relative rounded-[2.5rem] overflow-hidden snap-start shadow-xl border border-white/10 group cursor-pointer"
                            >
                                <video
                                    key={story.video}
                                    className="spotlight-video w-full h-full object-cover transition-all duration-700"
                                    autoPlay
                                    muted={muted}
                                    loop
                                    playsInline
                                    poster={story.poster}
                                    disablePictureInPicture
                                >
                                    <source src={story.video} type="video/mp4" />
                                </video>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                <div className="absolute top-5 left-5 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                                    <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-wider">REEL</span>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <span className="text-[8px] font-black uppercase text-white/70 tracking-widest">
                                            {story.category}
                                        </span>
                                    </div>
                                    <h3 className="text-white font-bold text-sm md:text-base leading-tight uppercase">
                                        {story.title}
                                    </h3>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/40 flex items-center justify-center">
                                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SpotlightStories;
