import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

// GET - Récupérer toutes les catégories
export async function GET(request: NextRequest) {
  try {
    // Récupérer le paramètre parent_id si fourni
    const searchParams = request.nextUrl.searchParams
    const parentId = searchParams.get("parent_id")
    const flat = searchParams.get("flat") === "true" // Option pour récupérer toutes les catégories à plat

    let categories

    if (flat) {
      // Retourner toutes les catégories à plat
      categories = await prisma.category.findMany({
        include: {
          parent: true,
          _count: {
            select: {
              listings: true,
              children: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    } else if (parentId) {
      // Retourner les enfants d'une catégorie spécifique
      categories = await prisma.category.findMany({
        where: { parentId: parentId === "null" ? null : parentId },
        include: {
          _count: {
            select: {
              listings: true,
              children: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    } else {
      // Par défaut, retourner uniquement les catégories principales avec leurs enfants
      categories = await prisma.category.findMany({
        where: { parentId: null },
        include: {
          children: {
            include: {
              _count: {
                select: {
                  listings: true
                }
              }
            },
            orderBy: {
              name: 'asc'
            }
          },
          _count: {
            select: {
              listings: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle catégorie (Admin uniquement)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, icon, parentId } = body

    // TODO: Vérifier que l'utilisateur est admin
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json(
    //     { error: "Accès non autorisé" },
    //     { status: 403 }
    //   )
    // }

    // Vérifier l'unicité du slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Une catégorie avec ce slug existe déjà" },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        parentId
      },
      include: {
        parent: true,
        children: true
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une catégorie (Admin uniquement)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug, description, icon, parentId } = body

    // TODO: Vérifier que l'utilisateur est admin

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de la catégorie est requis" },
        { status: 400 }
      )
    }

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      )
    }

    // Si le slug change, vérifier l'unicité
    if (slug && slug !== existingCategory.slug) {
      const categoryWithSlug = await prisma.category.findUnique({
        where: { slug }
      })

      if (categoryWithSlug) {
        return NextResponse.json(
          { error: "Une catégorie avec ce slug existe déjà" },
          { status: 400 }
        )
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        icon,
        parentId
      },
      include: {
        parent: true,
        children: true
      }
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la catégorie" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une catégorie (Admin uniquement)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    // TODO: Vérifier que l'utilisateur est admin

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de la catégorie est requis" },
        { status: 400 }
      )
    }

    // Vérifier si la catégorie a des annonces
    const categoryWithListings = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            listings: true
          }
        }
      }
    })

    if (!categoryWithListings) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      )
    }

    if (categoryWithListings._count.listings > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer une catégorie contenant des annonces" },
        { status: 400 }
      )
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: "Catégorie supprimée avec succès" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la catégorie" },
      { status: 500 }
    )
  }
}