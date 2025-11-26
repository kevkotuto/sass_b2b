import Image from "next/image"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
    title: string
    image?: React.ReactNode // Using ReactNode for icons/illustrations
    className?: string
}

export function CategoryCard({ title, image, className }: CategoryCardProps) {
    return (
        <div className={cn("bg-[#FFF8E7] rounded-xl p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer h-40", className)}>
            <div className="mb-4">
                {image}
            </div>
            <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
    )
}
