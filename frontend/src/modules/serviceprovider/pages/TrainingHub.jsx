import React, { useState } from "react";
import {
    PlayCircle,
    CheckCircle2,
    Clock,
    ChevronLeft,
    Search,
    Filter
} from "lucide-react";
import { Card, CardContent } from "@/modules/user/components/ui/card";
import { Badge } from "@/modules/user/components/ui/badge";
import { Button } from "@/modules/user/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TrainingHub() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Hair Styling", "Makeup", "Skin Care", "Hygiene"];

    const videos = [
        {
            id: 1,
            title: "Advanced Hair Styling Techniques",
            category: "Hair Styling",
            duration: "15:30",
            status: "Completed",
            thumbnail: "https://images.unsplash.com/photo-1560869713-7d0a294308a3?auto=format&fit=crop&w=400&q=80",
            provider: "stylingwithmuskan Academy"
        },
        {
            id: 2,
            title: "Bridal Makeup Mastery 2026",
            category: "Makeup",
            duration: "45:00",
            status: "Ongoing",
            thumbnail: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
            provider: "Senior Artist - Rhea"
        },
        {
            id: 3,
            title: "Hygiene & Sanitization Standards",
            category: "Hygiene",
            duration: "12:15",
            status: "Mandatory",
            thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80",
            provider: "SWM Compliance Team"
        },
        {
            id: 4,
            title: "Deep Cleansing Routine",
            category: "Skin Care",
            duration: "20:00",
            status: "New",
            thumbnail: "https://images.unsplash.com/photo-1570172235384-a0e3d5904003?auto=format&fit=crop&w=400&q=80",
            provider: "Skin Care Lead"
        }
    ];

    const filteredVideos = selectedCategory === "All"
        ? videos
        : videos.filter(v => v.category === selectedCategory);

    return (
        <div className="flex flex-col bg-white min-h-screen -m-4 md:m-0">
            {/* Simple Header */}
            <div className="p-4 flex items-center gap-4 border-b">
                <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold">Training Hub</h2>
            </div>

            {/* Category Filter */}
            <div className="p-4 overflow-x-auto border-b">
                <div className="flex gap-2 whitespace-nowrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${selectedCategory === cat
                                ? "bg-purple-600 border-purple-600 text-white"
                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 p-4 grid gap-6 pb-20 overflow-y-auto">
                {filteredVideos.map(video => (
                    <Card key={video.id} className="overflow-hidden border-none shadow-md group cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="relative aspect-video">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                <PlayCircle className="h-14 w-14 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {video.duration}
                            </div>
                            {video.status === "Mandatory" && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-tighter">
                                    Mandatory
                                </div>
                            )}
                        </div>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                                    {video.category}
                                </span>
                                {video.status === "Completed" ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-gray-500 border-gray-200">{video.status}</Badge>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                                {video.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Provided by {video.provider}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
