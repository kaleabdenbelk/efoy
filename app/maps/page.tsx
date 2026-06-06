"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { restaurants } from "@/lib/restaurants";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star, Search, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RestaurantMap = dynamic(() => import("@/components/restaurant-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-xl" />,
});

export default function Page() {
  const [activeId, setActiveId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-svh bg-background overflow-hidden p-2 md:p-4 gap-4">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-[350px] gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Addis Eats</h1>
          <p className="text-sm text-muted-foreground">Discover the best restaurants in Addis Ababa.</p>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search category or name..."
              className="pl-9 bg-muted/50 border-none ring-offset-background focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="flex flex-col gap-3 pr-2 pb-4">
            {filteredRestaurants.map((restaurant) => (
              <Card 
                key={restaurant.id}
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 bg-card/50 backdrop-blur-sm border-muted ${
                  activeId === restaurant.id ? "ring-2 ring-primary border-transparent translate-x-1" : ""
                }`}
                onClick={() => setActiveId(restaurant.id)}
              >
                <CardContent className="p-3 flex gap-3">
                  <div className="relative w-20 h-20 shrink-0">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col justify-between overflow-hidden">
                    <div>
                      <h3 className="font-bold text-sm truncate">{restaurant.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-[10px] py-0 px-1">{restaurant.category}</Badge>
                        <span className="text-[10px] font-bold flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 stroke-yellow-400" />
                          {restaurant.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
                      {restaurant.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredRestaurants.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground italic">
                <Utensils className="w-8 h-8 mb-2 opacity-20" />
                No restaurants found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content (Map) */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-[500] md:hidden">
           <Button size="icon" variant="secondary" className="rounded-full shadow-lg h-10 w-10 bg-background/80 backdrop-blur-md">
             <Utensils className="h-5 w-5" />
           </Button>
        </div>

        <RestaurantMap 
          restaurants={filteredRestaurants} 
          activeId={activeId}
          onSelect={(id) => setActiveId(id)}
        />
        
        {/* Mobile Floating Gradient Title */}
        <div className="md:hidden absolute top-4 left-0 right-0 pointer-events-none flex justify-center z-[501]">
           <div className="bg-background/40 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 shadow-xl">
             <span className="text-sm font-bold tracking-tight">ADDIS EATS</span>
           </div>
        </div>
      </div>
    </div>
  );
}
