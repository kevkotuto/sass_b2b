"use client"

import { Search, Wrench, Truck, Sprout, Dog, Monitor } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CategoryCard } from "@/components/CategoryCard"
import { ListingCard } from "@/components/ListingCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const categories = [
    { title: "Bricolage", icon: <Wrench className="w-12 h-12 text-gray-700" />, color: "bg-[#F5F5DC]" },
    { title: "Transport", icon: <Truck className="w-12 h-12 text-gray-700" />, color: "bg-[#E0F7FA]" },
    { title: "Jardinage", icon: <Sprout className="w-12 h-12 text-gray-700" />, color: "bg-[#FFF3E0]" },
    { title: "Animaux", icon: <Dog className="w-12 h-12 text-gray-700" />, color: "bg-[#FCE4EC]" },
    { title: "Informatique", icon: <Monitor className="w-12 h-12 text-gray-700" />, color: "bg-[#E8F5E9]" },
  ]

  const books = [
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

  const nannies = [
    {
      title: "Nabil",
      price: "démarre à partir de 1500 fcfa/h",
      location: "Cocody, Abidjan",
      imageSrc: "https://placehold.co/400x300/png?text=Nabil",
      tags: ["Déchiffrage", "Coiffure"],
      user: { name: "Nabil", rating: 4.9, reviews: 1588 },
      isTop: true
    },
    {
      title: "Nabil",
      price: "démarre à partir de 1500 fcfa/h",
      location: "Cocody, Abidjan",
      imageSrc: "https://placehold.co/400x300/png?text=Nabil",
      tags: ["Déchiffrage", "Coiffure"],
      user: { name: "Nabil", rating: 4.9, reviews: 1588 },
      isTop: true
    },
    {
      title: "Nabil",
      price: "démarre à partir de 1500 fcfa/h",
      location: "Cocody, Abidjan",
      imageSrc: "https://placehold.co/400x300/png?text=Nabil",
      tags: ["Déchiffrage", "Coiffure"],
      user: { name: "Nabil", rating: 4.9, reviews: 1588 },
      isTop: true
    },
    {
      title: "Nabil",
      price: "démarre à partir de 1500 fcfa/h",
      location: "Cocody, Abidjan",
      imageSrc: "https://placehold.co/400x300/png?text=Nabil",
      tags: ["Déchiffrage", "Coiffure"],
      user: { name: "Nabil", rating: 4.9, reviews: 1588 },
      isTop: true
    },
  ]

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#1E4D2B] py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
              Consulter de l'aide sur AGORA <br /> près votre chez-vous
            </h1>

            <div className="relative max-w-2xl mx-auto">
              <div className="bg-white rounded-full p-2 flex items-center shadow-lg">
                <Input
                  type="text"
                  placeholder="Carreleur salle de bain"
                  className="border-0 shadow-none focus-visible:ring-0 text-gray-700 text-lg px-6 flex-grow"
                />
                <Button className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-full px-8 py-6 text-lg font-medium">
                  <Search className="w-5 h-5 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Nos catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat, index) => (
              <CategoryCard
                key={index}
                title={cat.title}
                image={cat.icon}
                className={cat.color}
              />
            ))}
          </div>
        </section>

        {/* Livres scolaires Section */}
        <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Livres scolaires</h2>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Voir plus d'offres</a>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {books.map((item, index) => (
              <ListingCard key={index} {...item} />
            ))}
          </div>
        </section>

        {/* Nounous Section */}
        <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Des nounous qualifiés</h2>
            <p className="text-sm text-gray-500">Recherchez vos services par catégories</p>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900 ml-auto">Voir plus d'offres</a>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {nannies.map((item, index) => (
              <ListingCard key={index} {...item} />
            ))}
          </div>
        </section>

        {/* Bien meublés Section */}
        <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Des bien meublés</h2>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Voir plus d'offres</a>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {books.map((item, index) => ( // Reusing books data for demo
              <ListingCard key={index} {...item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
