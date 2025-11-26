import { Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserCardProps {
    name: string
    imageSrc: string
    rate: string
    stats: {
        evaluations: number
        rating: number
        years: number
    }
}

export function UserCard({ name, imageSrc, rate, stats }: UserCardProps) {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-64 w-full">
                <img
                    src={imageSrc}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                    <h3 className="text-xl font-bold">{name}</h3>
                </div>
                <Badge className="absolute bottom-4 right-4 bg-white text-gray-900 hover:bg-white font-bold px-3 py-1">
                    {rate}
                </Badge>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100 py-4 bg-gray-50">
                <div className="text-center px-2">
                    <p className="text-lg font-bold text-gray-900">{stats.evaluations}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Évaluations</p>
                </div>
                <div className="text-center px-2">
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-lg font-bold text-gray-900">{stats.rating.toFixed(2).replace('.', ',')}</span>
                        <Heart className="w-3 h-3 fill-green-500 text-green-500" />
                    </div>
                    <p className="text-[10px] text-green-600 uppercase tracking-wide">Note sur 5</p>
                </div>
                <div className="text-center px-2">
                    <p className="text-lg font-bold text-gray-900">{stats.years}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">ans chez Agora</p>
                </div>
            </div>
        </div>
    )
}
