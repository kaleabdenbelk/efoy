"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Star, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Restaurant } from "@/lib/restaurants";

// Fix Leaflet marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="color: ${color}; transform: translateY(-50%); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    className: "custom-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

const defaultIcon = createCustomIcon("#ef4444"); // red-500
const activeIcon = createCustomIcon("#3b82f6"); // blue-500

function SetViewOnClick({ animateRef, coords }: { animateRef: boolean; coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (animateRef) {
      map.setView(coords, 15, { animate: true });
    }
  }, [coords, animateRef, map]);
  return null;
}

export default function RestaurantMap({ 
  restaurants, 
  activeId,
  onSelect 
}: { 
  restaurants: Restaurant[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-muted animate-pulse rounded-xl" />;

  const center: [number, number] = [8.995, 38.785]; // Default center

  const activeRestaurant = restaurants.find(r => r.id === activeId);

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden border shadow-lg">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {restaurants.map((restaurant) => (
          <Marker 
            key={restaurant.id} 
            position={restaurant.position}
            icon={activeId === restaurant.id ? activeIcon : defaultIcon}
            eventHandlers={{
              click: () => onSelect(restaurant.id),
            }}
          >
            <Popup className="restaurant-popup">
              <div className="flex flex-col gap-1 p-1 min-w-[150px]">
                <h3 className="font-bold text-sm">{restaurant.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                  <span className="text-xs font-semibold">{restaurant.rating}</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1">{restaurant.category}</Badge>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <SetViewOnClick 
          animateRef={!!activeId} 
          coords={activeRestaurant ? activeRestaurant.position : center} 
        />
      </MapContainer>
      
      {/* Detail Overlay if active */}
      {activeRestaurant && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] md:hidden">
          <Card className="glassmorphism border-none shadow-2xl">
            <CardContent className="p-4 flex gap-4">
              <img 
                src={activeRestaurant.image} 
                alt={activeRestaurant.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="font-bold">{activeRestaurant.name}</h2>
                <p className="text-xs text-muted-foreground line-clamp-2">{activeRestaurant.description}</p>
                <div className="flex items-center gap-2 mt-1">
                   <Badge>{activeRestaurant.category}</Badge>
                   <span className="text-xs font-bold flex items-center gap-1">
                     <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
                     {activeRestaurant.rating}
                   </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
