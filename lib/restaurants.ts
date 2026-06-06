export interface Restaurant {
  id: string;
  name: string;
  description: string;
  position: [number, number]; // [lat, lng]
  rating: number;
  category: string;
  image: string;
}

export const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Yod Abyssinia Traditional Restaurant",
    description: "Classic Ethiopian cuisine with traditional music and dance performances.",
    position: [8.995, 38.785],
    rating: 4.5,
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "2000 Habesha Cultural Restaurant",
    description: "Spacious restaurant offering cultural buffet and live performances.",
    position: [9.001, 38.788],
    rating: 4.4,
    category: "Cultural",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Kategna Ethiopian Restaurant",
    description: "Famous for its crispy injera and delicious kitfo.",
    position: [9.015, 38.751],
    rating: 4.7,
    category: "Local",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Gustavo Italian Restaurant",
    description: "Modern Italian dining with a great view and fine wines.",
    position: [8.998, 38.765],
    rating: 4.3,
    category: "Italian",
    image: "https://images.unsplash.com/photo-1551183053-bf91e1d81141?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "5",
    name: "Sichuan Restaurant",
    description: "Authentic Sichuan flavors in the heart of Addis.",
    position: [9.012, 38.775],
    rating: 4.2,
    category: "Chinese",
    image: "https://images.unsplash.com/photo-1512058560366-cd2427ff6675?q=80&w=800&auto=format&fit=crop",
  },
];
