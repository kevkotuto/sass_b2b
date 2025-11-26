"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MapPin, Calendar, Hammer, Heart, MessageSquare, Shield, Phone, Globe } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { UserCard } from "@/components/UserCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ListingCard } from "@/components/ListingCard"
import MapView from "@/components/MapView"

export default function ListingDetailsPage() {
    const params = useParams()
    const [activeTab, setActiveTab] = useState("description")

    // Mock data
    const listing = {
        id: "1",
        title: "Vente immeuble r +5 - Cocody",
        price: 1500000000,
        currency: "CFA",
        publishedAt: "il y a 4 jours",
        location: "Angré, Abidjan, Côte d'Ivoire",
        category: "Construction",
        imageSrc: "https://placehold.co/800x600/png?text=Immeuble",
        description: `Compétences en matière de réparation et de fixation, comme la fixation d'une étagère, le remplacement d'une poignée ou le resserrement d'une vis. Capacité à lire et interpréter des plans pour suivre des instructions de montage ou de bricolage.
    
    Compétences en matière de réparation et de fixation, comme la fixation d'une étagère, le remplacement d'une poignée ou le resserrement d'une vis. Capacité à lire et interpréter des plans pour suivre des instructions de montage ou de bricolage.`,
        engagements: ["Respect des lieux", "Travail soigné", "Chantier propre"],
        zone: {
            lat: 5.3599517,
            lng: -4.0082563,
            address: "72WM+H5H, Boulevard du Cameroun, Abidjan"
        },
        user: {
            name: "Nabil",
            imageSrc: "https://placehold.co/400x400/png?text=Nabil",
            rate: "30 €/h",
            stats: {
                evaluations: 1599,
                rating: 4.95,
                years: 2
            }
        }
    }

    const otherListings = [
        {
            title: "LM-Armoires Mobiles - 6 étagères - Café",
            price: "à partir de 10,101 FCFA",
            location: "Cocody, Abidjan, Côte d'Ivoire",
            imageSrc: "https://placehold.co/400x300/png?text=Armoire",
            tags: ["Bon état", "Meuble", "Unique"],
            user: { name: "SKY MALL-CI", rating: 4.5, reviews: 1588 },
            isTop: false
        },
        {
            title: "Vente immeuble r+5 - Cocody",
            price: "à partir de 22.500 FCFA",
            location: "Angré, Abidjan, Côte d'Ivoire",
            imageSrc: "https://placehold.co/400x300/png?text=Immeuble",
            tags: ["Immeuble"],
            user: { name: "Romeo Jean", rating: 4.9, reviews: 1588 },
            isTop: true
        },
        {
            title: "Les secrets de la femme de ménage",
            price: "à partir de 22.500 FCFA",
            location: "Cocody, Abidjan, Côte d'Ivoire",
            imageSrc: "https://placehold.co/400x300/png?text=Livre",
            tags: ["Neuf", "Livre", "Unique"],
            user: { name: "Jacob Jones", rating: 4.8, reviews: 1588 },
            isTop: true
        },
    ]

    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <Header />

            <main className="flex-grow py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
                {/* Breadcrumb */}
                <div className="text-xs text-gray-500 mb-6 flex items-center gap-1">
                    <Link href="/" className="hover:text-gray-900">Accueil</Link>
                    <span>&gt;</span>
                    <Link href="#" className="hover:text-gray-900">Immobilier</Link>
                    <span>&gt;</span>
                    <Link href="#" className="hover:text-gray-900">Immeubles</Link>
                    <span>&gt;</span>
                    <span className="text-gray-900">Vente immeuble r +5 - Cocody</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image */}
                        <div className="relative rounded-2xl overflow-hidden bg-gray-200 aspect-video">
                            <img
                                src={listing.imageSrc}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 left-4">
                                <Badge className="bg-green-600/90 hover:bg-green-700 text-white border-0 px-3 py-1.5 flex items-center gap-1.5 backdrop-blur-sm">
                                    <Heart className="w-3 h-3 fill-white" />
                                    Top annonce
                                </Badge>
                            </div>
                        </div>

                        {/* Title & Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                            <p className="text-3xl font-bold text-[#F59E0B] mb-4">
                                {formatPrice(listing.price)} {listing.currency}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>publié {listing.publishedAt}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{listing.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Hammer className="w-3 h-3" />
                                    <span>{listing.category}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex">
                            {["Description", "Services", "Notations"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.toLowerCase()
                                            ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">{activeTab}</h3>
                            <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                                {listing.description}
                            </div>
                        </div>

                        {/* Engagements */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Engagements clients</h3>
                            <div className="flex flex-wrap gap-2">
                                {listing.engagements.map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 px-3 py-1.5 font-normal">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Zone d'intervention */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Zone d'intervention</h3>
                            <p className="text-sm text-gray-500 mb-4">{listing.zone.address}</p>
                            <div className="h-64 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative">
                                <MapView
                                    listings={[{
                                        id: listing.id,
                                        title: listing.title,
                                        description: "",
                                        price: listing.price,
                                        currency: listing.currency,
                                        type: "PRODUCT",
                                        latitude: listing.zone.lat,
                                        longitude: listing.zone.lng,
                                        distance: 0,
                                        user: {
                                            firstName: listing.user.name,
                                            lastName: "",
                                            verified: true
                                        },
                                        category: { name: listing.category }
                                    }]}
                                    center={[listing.zone.lat, listing.zone.lng]}
                                    height="100%"
                                />
                            </div>
                        </div>

                        {/* Other Listings */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Les annonces de ce profil</h3>
                                <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Voir plus d'offres</Link>
                            </div>
                            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
                                {otherListings.map((item, index) => (
                                    <ListingCard key={index} {...item} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Publié par</h3>
                            <UserCard
                                name={listing.user.name}
                                imageSrc={listing.user.imageSrc}
                                rate={listing.user.rate}
                                stats={listing.user.stats}
                            />
                        </div>

                        <div className="space-y-3">
                            <Button className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-medium py-6 rounded-xl text-base">
                                Contacter
                            </Button>
                            <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-6 rounded-xl text-base">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Envoyer un message
                            </Button>
                        </div>

                        <div className="pt-4">
                            <h3 className="font-bold text-green-800 text-sm mb-4 border-b border-gray-100 pb-2">
                                Couvertures et garanties sur Agora
                            </h3>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="w-8 h-8 rounded-full border border-orange-200 flex items-center justify-center text-orange-500">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs text-gray-900">Assistance 6 jours sur 7</h4>
                                        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                                            Service client disponible par téléphone et e-mail 6 jours sur 7.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="w-8 h-8 rounded-full border border-green-200 flex items-center justify-center text-green-600">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs text-gray-900">Couverture</h4>
                                        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                                            Gardez l'esprit tranquille, vos prestations sont protégées et ne payez pas vos prestataires en dehors du site
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
