import * as React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tag = { label: string } | string;

export interface User {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  verified: boolean;
}

export interface ItemCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  title: string;
  type?: "PRODUCT" | "SERVICE";
  price: number;
  currency?: string;
  imageSrc?: string;
  imageAlt?: string;
  description?: string;
  location?: string;
  tags?: Tag[];
  user: User;
  liked?: boolean;
  onContact?: (id?: string) => void;
  onToggleLike?: (liked: boolean, id?: string) => void;
  ctaLabel?: string;
  highlight?: {
    title?: string[];
    description?: string[];
  };
}

const formatPrice = (value: number, currency = "CFA") => {
  try {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value) + ` ${currency}`;
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
};

export default function ItemCard({
  id,
  title,
  type = "PRODUCT",
  price,
  currency = "CFA",
  imageSrc,
  imageAlt,
  description,
  location,
  tags,
  user,
  liked = false,
  onContact,
  onToggleLike,
  ctaLabel = "Contacter",
  highlight,
  className,
  ...rest
}: ItemCardProps) {
  const [isLiked, setIsLiked] = React.useState(liked);

  const handleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    onToggleLike?.(next, id);
  };

  const isService = type === "SERVICE";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-3xl border-0 bg-transparent shadow-none",
        className
      )}
      {...rest}
    >
      {imageSrc ? (
        <div className="relative rounded-3xl bg-gradient-to-br from-purple-200/70 via-purple-300/60 to-purple-400/60 p-3 sm:p-4">
          <div className="absolute inset-0 -z-10 rounded-3xl shadow-[0_20px_60px_-20px_rgba(109,40,217,0.3)]" />

          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={handleLike}
            className={cn(
              "absolute right-4 top-4 h-10 w-10 rounded-full bg-white/70 backdrop-blur hover:bg-white z-10",
              isLiked && "text-rose-600"
            )}
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          </Button>

          <Badge
            variant={isService ? 'default' : 'secondary'}
            className="absolute top-4 left-4 z-10"
          >
            {isService ? '🔧 Service' : '📦 Produit'}
          </Badge>

          <AspectRatio ratio={16 / 10} className="mx-auto w-full">
            <div className="relative h-full w-full">
              <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-white/40 via-white/10 to-transparent blur-2xl" />
              <img
                src={imageSrc}
                alt={imageAlt ?? title}
                className="absolute left-1/2 top-1/2 h-auto w-[78%] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] object-contain drop-shadow-2xl transition-transform duration-300 ease-out group-hover:rotate-[-9deg] group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
          </AspectRatio>
        </div>
      ) : (
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-100/70 via-blue-200/60 to-blue-300/60 p-8">
          <div className="absolute inset-0 -z-10 rounded-3xl shadow-[0_20px_60px_-20px_rgba(59,130,246,0.3)]" />

          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
            onClick={handleLike}
            className={cn(
              "absolute right-4 top-4 h-10 w-10 rounded-full bg-white/70 backdrop-blur hover:bg-white z-10",
              isLiked && "text-rose-600"
            )}
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          </Button>

          <Badge
            variant={isService ? 'default' : 'secondary'}
            className="absolute top-4 left-4 z-10"
          >
            {isService ? '🔧 Service' : '📦 Produit'}
          </Badge>

          <div className="flex items-center justify-center h-32">
            <div className="text-6xl opacity-60">
              {isService ? '🔧' : '📦'}
            </div>
          </div>
        </div>
      )}

      <CardContent className="relative -mt-4 rounded-3xl border bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-bold tracking-tight text-gray-900 line-clamp-2">
          {highlight?.title ? (
            <span dangerouslySetInnerHTML={{ __html: highlight.title[0] }} />
          ) : (
            title
          )}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tags?.slice(0, 3).map((t, i) => (
            <Badge key={i} variant="outline" className="rounded-xl px-2.5 py-1 text-xs">
              {typeof t === "string" ? t : t.label}
            </Badge>
          ))}
        </div>

        {description && (
          <p className="mt-4 text-base leading-7 text-muted-foreground line-clamp-2">
            {highlight?.description ? (
              <span dangerouslySetInnerHTML={{ __html: highlight.description[0] }} />
            ) : (
              description
            )}
          </p>
        )}

        {location && (
          <div className="flex items-center text-sm text-gray-500 mt-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{location}</span>
          </div>
        )}

        {/* User info */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-purple-500 text-white text-sm">
              {user.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{user.name || 'Utilisateur'}</span>
              {user.verified && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 px-1.5 py-0.5">
                  ✓
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-500">{user.score.toFixed(1)}/5</span>
            </div>
          </div>
        </div>

        <CardFooter className="mt-5 flex items-center justify-between gap-3 p-0">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {isService ? "Tarif" : "Prix"}
            </p>
            <p className="text-3xl font-extrabold leading-none">{formatPrice(price, currency)}</p>
          </div>

          <Button
            type="button"
            size="lg"
            className="h-12 rounded-2xl px-6 text-base bg-purple-600 hover:bg-purple-700"
            onClick={() => onContact?.(id)}
          >
            <MessageSquare className="mr-2 h-5 w-5" /> {ctaLabel}
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}