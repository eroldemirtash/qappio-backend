const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Task = require('../models/Task');
const Level = require('../models/Level');
const MarketItem = require('../models/Market');

// Sample data
const sampleTasks = [
  {
    title: "Nike Ayakkabı Fotoğrafı",
    description: "Yeni Nike ayakkabınızın fotoğrafını çekip paylaşın. Ayakkabı kutusunun da görünmesi gerekiyor.",
    brand: "Nike",
    category: "Fotoğraf",
    status: "Aktif",
    budget: 5000,
    participants: 23,
    maxParticipants: 100,
    reward: 50,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isWeekly: false,
    isSponsored: true,
    sponsorBrand: "Nike",
    requirements: ["Ayakkabı kutusu görünmeli", "İyi ışıklandırma", "Temiz arka plan"],
    tags: ["ayakkabı", "nike", "spor", "moda"]
  },
  {
    title: "Starbucks İçecek İncelemesi",
    description: "Yeni sezon Starbucks içeceğini deneyin ve deneyiminizi paylaşın.",
    brand: "Starbucks",
    category: "İnceleme",
    status: "Aktif",
    budget: 3000,
    participants: 67,
    maxParticipants: 150,
    reward: 30,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-15'),
    isWeekly: true,
    isSponsored: false,
    requirements: ["Video minimum 30 saniye", "Ses kalitesi iyi olmalı"],
    tags: ["kahve", "starbucks", "içecek", "inceleme"]
  },
  {
    title: "Samsung Galaxy S24 Unboxing",
    description: "Yeni Samsung Galaxy S24'ünüzün kutu açılış videosunu çekin.",
    brand: "Samsung",
    category: "Video",
    status: "Aktif",
    budget: 10000,
    participants: 12,
    maxParticipants: 50,
    reward: 200,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-04-01'),
    isWeekly: false,
    isSponsored: true,
    sponsorBrand: "Samsung",
    requirements: ["HD kalite", "Minimum 2 dakika", "Türkçe anlatım"],
    tags: ["telefon", "samsung", "teknoloji", "unboxing"]
  }
];

const sampleLevels = [
  {
    name: "Çırak",
    color: "#8B7355",
    minPoints: 0,
    maxPoints: 999,
    order: 1,
    benefits: ["Temel görevlere erişim", "Market erişimi"],
    marketAccess: true,
    icon: "🥉"
  },
  {
    name: "Kalfa",
    color: "#C0C0C0",
    minPoints: 1000,
    maxPoints: 4999,
    order: 2,
    benefits: ["Orta seviye görevler", "Haftalık bonus", "Öncelikli destek"],
    marketAccess: true,
    icon: "🥈"
  },
  {
    name: "Usta",
    color: "#FFD700",
    minPoints: 5000,
    maxPoints: 14999,
    order: 3,
    benefits: ["Premium görevler", "Özel indirimler", "VIP etkinlikler"],
    marketAccess: true,
    icon: "🥇"
  },
  {
    name: "Viralist",
    color: "#E74C3C",
    minPoints: 15000,
    maxPoints: 49999,
    order: 4,
    benefits: ["Sponsorlu görevler", "Özel ödüller", "Beta özellikler"],
    marketAccess: true,
    icon: "💎",
    specialPerks: [
      {
        name: "Viral Bonus",
        description: "Paylaşımlarınız viral olduğunda ekstra puan",
        isActive: true
      }
    ]
  },
  {
    name: "Qappian",
    color: "#1A237E",
    minPoints: 50000,
    maxPoints: 999999,
    order: 5,
    benefits: ["Tüm özelliklere erişim", "Kişisel danışman", "Sınırsız avantajlar"],
    marketAccess: true,
    icon: "👑",
    specialPerks: [
      {
        name: "Qappian Exclusive",
        description: "Sadece Qappian'lara özel özellikler",
        isActive: true
      },
      {
        name: "Personal Manager",
        description: "Kişisel hesap yöneticisi",
        isActive: true
      }
    ]
  }
];

const sampleMarketItems = [
  {
    name: "iPhone 15 Pro",
    description: "Son teknoloji iPhone 15 Pro - 128GB Kapasiteli",
    brand: "Apple",
    category: "Elektronik",
    qpPrice: 25000,
    realPrice: 50000,
    currency: "TL",
    stock: 5,
    levelAccess: "Gold+",
    minLevelPoints: 5000,
    images: [
      {
        url: "https://example.com/iphone15pro.jpg",
        alt: "iPhone 15 Pro",
        isPrimary: true
      }
    ],
    status: "Aktif",
    featured: true,
    specifications: [
      { key: "Depolama", value: "128GB" },
      { key: "Renk", value: "Space Black" },
      { key: "Garanti", value: "2 Yıl" }
    ],
    tags: ["telefon", "apple", "iphone", "premium"],
    deliveryInfo: {
      type: "Physical",
      estimatedDays: 3,
      description: "Kargo ile gönderilir"
    }
  },
  {
    name: "Starbucks 50 TL Hediye Kartı",
    description: "Starbucks mağazalarında geçerli 50 TL hediye kartı",
    brand: "Starbucks",
    category: "Hediye Kartı",
    qpPrice: 1000,
    realPrice: 50,
    currency: "TL",
    stock: -1, // Unlimited
    levelAccess: "Tüm Seviyeler",
    minLevelPoints: 0,
    images: [
      {
        url: "https://example.com/starbucks-card.jpg",
        alt: "Starbucks Gift Card",
        isPrimary: true
      }
    ],
    status: "Aktif",
    featured: true,
    specifications: [
      { key: "Değer", value: "50 TL" },
      { key: "Geçerlilik", value: "2 Yıl" },
      { key: "Kullanım", value: "Tüm Starbucks Mağazaları" }
    ],
    tags: ["hediye", "kahve", "starbucks", "kart"],
    sales: 156,
    revenue: 156000,
    deliveryInfo: {
      type: "Digital",
      estimatedDays: 0,
      description: "E-posta ile anında gönderilir"
    }
  },
  {
    name: "Nike Air Max 270",
    description: "Rahat ve şık Nike Air Max 270 spor ayakkabı",
    brand: "Nike",
    category: "Spor",
    qpPrice: 8000,
    realPrice: 1200,
    currency: "TL",
    stock: 15,
    levelAccess: "Silver+",
    minLevelPoints: 1000,
    images: [
      {
        url: "https://example.com/nike-air-max.jpg",
        alt: "Nike Air Max 270",
        isPrimary: true
      }
    ],
    status: "Aktif",
    featured: false,
    discount: {
      percentage: 20,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-01'),
      isActive: true
    },
    specifications: [
      { key: "Beden", value: "42" },
      { key: "Renk", value: "Siyah/Beyaz" },
      { key: "Materyal", value: "Mesh/Sentetik" }
    ],
    tags: ["ayakkabı", "nike", "spor", "koşu"],
    sales: 23,
    revenue: 147200,
    rating: {
      average: 4.5,
      count: 18
    },
    deliveryInfo: {
      type: "Physical",
      estimatedDays: 5,
      description: "Kargo ile gönderilir"
    }
  }
];

// Connect to MongoDB and seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qappio');
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Task.deleteMany({});
    await Level.deleteMany({});
    await MarketItem.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert sample data
    const tasks = await Task.insertMany(sampleTasks);
    console.log(`✅ Inserted ${tasks.length} tasks`);

    const levels = await Level.insertMany(sampleLevels);
    console.log(`✅ Inserted ${levels.length} levels`);

    const marketItems = await MarketItem.insertMany(sampleMarketItems);
    console.log(`✅ Inserted ${marketItems.length} market items`);

    console.log('🎉 Database seeded successfully!');
    
    // Display summary
    console.log('\n📊 Data Summary:');
    console.log(`Tasks: ${tasks.length}`);
    console.log(`Levels: ${levels.length}`);
    console.log(`Market Items: ${marketItems.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
