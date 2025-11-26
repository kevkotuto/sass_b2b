import Image from "next/image"
import { Heart, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import Link from "next/link"

interface ListingCardProps {
    id?: string
    title: string
    price: string
    location: string
    imageSrc: string
    user: {
        name: string
        rating: number
        reviews: number
        avatar?: string
    }
    tags?: string[]
    isTop?: boolean
}

export function ListingCard({ id = "1", title, price, location, imageSrc, user, tags, isTop }: ListingCardProps) {
    return (
        <Link href={`/listings/${id}`} className="block">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow min-w-[280px] max-w-[280px]">
                <div className="relative h-48 bg-gray-100">
                    {/* Placeholder for image if src is not valid, but we assume it is or use a fallback */}
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                        {/* If we had real images we'd use next/image here */}
                        <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
                    </div>

                    {isTop && (
                        <Badge className="absolute top-3 left-3 bg-green-100 text-green-700 hover:bg-green-100 border-0 text-xs font-medium px-2 py-0.5">
                            Top annonce
                        </Badge>
                    )}

                    <button className="absolute top-3 right-3 text-white hover:text-red-500 transition-colors z-10" onClick={(e) => e.preventDefault()}>
                        <Heart className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 h-10">{title}</h3>
                    <p className="text-sm font-bold text-gray-900 mb-2">{price}</p>

                    <div className="flex items-center text-xs text-gray-500 mb-3">
                        <span className="truncate">{location}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                        {tags?.map((tag, i) => (
                            <span key={i} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                {/* Avatar */}
                                {user.avatar ? <img src={user.avatar} alt={user.name} /> : <div className="w-full h-full bg-orange-200" />}
                            </div>
                            <span className="text-xs text-gray-600 truncate max-w-[80px]">{user.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{user.rating}</span>
                            <span className="text-gray-400">({user.reviews})</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
