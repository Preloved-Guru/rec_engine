export interface PreLovedItem {
    id: string;
    imageUrl: string;
    name: string;
    brand: string;
    price: number;
    condition: string;
    size: string;
    categories: string[];
}

export interface UserProfile {
    name: string;
    sizes: {
        shoes: string;
        pants: string;
        tops: string;
    };
    interests: string[];
}

// Mock user data
export const mockUser: UserProfile = {
    name: "Jennifer",
    sizes: {
        shoes: "8",
        pants: "6",
        tops: "M"
    },
    interests: ["jewelry", "bags"]
};

// Mock product data
export const mockProducts: PreLovedItem[] = [
    {
        id: "1",
        imageUrl: "/placeholder.jpg",
        name: "Vintage Leather Bag",
        brand: "Coach",
        price: 59.99,
        condition: "Good",
        size: "One Size",
        categories: ["Bags", "Accessories"]
    },
    {
        id: "2",
        imageUrl: "/placeholder.jpg",
        name: "Gold Necklace",
        brand: "Madewell",
        price: 29.99,
        condition: "Like New",
        size: "18 inch",
        categories: ["Jewelry", "Accessories"]
    },
    {
        id: "3",
        imageUrl: "/placeholder.jpg",
        name: "Platform Sandals",
        brand: "Steve Madden",
        price: 45.99,
        condition: "Excellent",
        size: "8",
        categories: ["Shoes"]
    }
];

// Mock trending items
export const mockTrendingJewelry: PreLovedItem[] = [
    {
        id: "t1",
        imageUrl: "/placeholder.svg",
        name: "Pearl Earrings",
        brand: "Kate Spade",
        price: 5.99,
        condition: "New",
        size: "One Size",
        categories: ["Jewelry"]
    },
    {
        id: "t2",
        imageUrl: "/placeholder.svg",
        name: "Silver Bracelet",
        brand: "Pandora",
        price: 5.99,
        condition: "Like New",
        size: "7 inch",
        categories: ["Jewelry"]
    },
    {
        id: "t3",
        imageUrl: "/placeholder.svg",
        name: "Crystal Necklace",
        brand: "Swarovski",
        price: 5.99,
        condition: "Excellent",
        size: "16 inch",
        categories: ["Jewelry"]
    },
    {
        id: "t4",
        imageUrl: "/placeholder.svg",
        name: "Gold Ring",
        brand: "Mejuri",
        price: 5.99,
        condition: "Good",
        size: "7",
        categories: ["Jewelry"]
    },
    {
        id: "t5",
        imageUrl: "/placeholder.svg",
        name: "Diamond Studs",
        brand: "Tiffany & Co",
        price: 5.99,
        condition: "Like New",
        size: "One Size",
        categories: ["Jewelry"]
    },
    {
        id: "t6",
        imageUrl: "/placeholder.svg",
        name: "Charm Bracelet",
        brand: "Pandora",
        price: 5.99,
        condition: "Excellent",
        size: "7.5 inch",
        categories: ["Jewelry"]
    },
    {
        id: "t7",
        imageUrl: "/placeholder.svg",
        name: "Rose Gold Watch",
        brand: "Michael Kors",
        price: 5.99,
        condition: "Good",
        size: "One Size",
        categories: ["Jewelry", "Accessories"]
    },
    {
        id: "t8",
        imageUrl: "/placeholder.svg",
        name: "Opal Pendant",
        brand: "Local Eclectic",
        price: 5.99,
        condition: "New",
        size: "18 inch",
        categories: ["Jewelry"]
    }
];

// Mock new shoes
export const mockNewShoes: PreLovedItem[] = [
    {
        id: "s1",
        imageUrl: "/placeholder.svg",
        name: "Running Shoes",
        brand: "Nike",
        price: 5.99,
        condition: "New",
        size: "8",
        categories: ["Shoes"]
    },
    {
        id: "s2",
        imageUrl: "/placeholder.svg",
        name: "Ballet Flats",
        brand: "Sam Edelman",
        price: 5.99,
        condition: "Like New",
        size: "8",
        categories: ["Shoes"]
    },
    {
        id: "s3",
        imageUrl: "/placeholder.svg",
        name: "Ankle Boots",
        brand: "Madewell",
        price: 5.99,
        condition: "Excellent",
        size: "8",
        categories: ["Shoes"]
    },
    {
        id: "s4",
        imageUrl: "/placeholder.svg",
        name: "Sandals",
        brand: "Tory Burch",
        price: 5.99,
        condition: "Good",
        size: "8",
        categories: ["Shoes"]
    },
    {
        id: "s5",
        imageUrl: "/placeholder.svg",
        name: "Platform Sneakers",
        brand: "Converse",
        price: 5.99,
        condition: "Like New",
        size: "8",
        categories: ["Shoes"]
    },
    {
        id: "s6",
        imageUrl: "/placeholder.svg",
        name: "Leather Loafers",
        brand: "Gucci",
        price: 5.99,
        condition: "Excellent",
        size: "8",
        categories: ["Shoes"]
    },
    {
        id: "s7",
        imageUrl: "/placeholder.svg",
        name: "Espadrilles",
        brand: "Soludos",
        price: 5.99,
        condition: "New",
        size: "8",
        categories: ["Shoes"]
    },
    {
        id: "s8",
        imageUrl: "/placeholder.svg",
        name: "Heeled Mules",
        brand: "Steve Madden",
        price: 5.99,
        condition: "Good",
        size: "8",
        categories: ["Shoes"]
    }
]; 