import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';

// Load environment variables relative to backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

export const realisticProducts = [
  // --- ELECTRONICS (7 Products) ---
  {
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    description: 'Industry-leading noise cancellation with two processors and 8 microphones for superior clarity.',
    category: 'Electronics',
    price: 399.99,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-10T10:00:00Z')
  },
  {
    name: 'Apple iPad Air 11-inch M2 Chip',
    description: 'Stunning Liquid Retina display, ultra-fast performance with M2 chip, and all-day battery life.',
    category: 'Electronics',
    price: 599.00,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-12T11:00:00Z')
  },
  {
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    description: 'Quiet clicks, 8K DPI tracking on glass, and hyper-fast electromagnetic MagSpeed scrolling.',
    category: 'Electronics',
    price: 99.99,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-15T09:30:00Z')
  },
  {
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    description: 'QMK/VIA wireless mechanical keyboard with CNC aluminum body and hot-swappable switches.',
    category: 'Electronics',
    price: 199.50,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-18T14:20:00Z')
  },
  {
    name: 'Anker 737 Power Bank 24,000mAh 140W',
    description: 'Ultra-powerful two-way charging with smart digital display and Power Delivery 3.1.',
    category: 'Electronics',
    price: 149.99,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1609592426867-b50a41d06e23?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-20T08:15:00Z')
  },
  {
    name: 'Samsung 34-Inch ViewFinity S65TC Curved Monitor',
    description: 'Ultra-WQHD 1000R curved monitor with built-in Thunderbolt 4 ports and stereo speakers.',
    category: 'Electronics',
    price: 649.99,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-22T16:45:00Z')
  },
  {
    name: 'Budget USB-C Portable Lavalier Microphone',
    description: 'Basic plug-and-play omnidirectional lavalier microphone for quick voice notes.',
    category: 'Electronics',
    price: 19.99,
    rating: 2.5,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-25T13:00:00Z')
  },

  // --- APPAREL (7 Products) ---
  {
    name: 'Merino Wool Crewneck Sweater',
    description: '100% extra-fine Italian merino wool sweater offering natural temperature regulation.',
    category: 'Apparel',
    price: 128.00,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-11T12:00:00Z')
  },
  {
    name: 'Patagonia Torrentshell 3L Waterproof Rain Jacket',
    description: 'Simple and unpretentious 3-layer H2No Performance Standard jacket for all-day weather protection.',
    category: 'Apparel',
    price: 179.00,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-13T10:00:00Z')
  },
  {
    name: 'Organic Heavyweight Cotton Oversized Tee',
    description: '280 GSM heavyweight combed organic cotton tee with reinforced drop shoulders.',
    category: 'Apparel',
    price: 45.00,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-16T15:30:00Z')
  },
  {
    name: 'Selvedge Raw Denim Slim Fit Jeans',
    description: '14oz Japanese red-line selvedge denim crafted with authentic shuttle loom weave.',
    category: 'Apparel',
    price: 165.00,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1542272604-780c96856453?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-19T09:00:00Z')
  },
  {
    name: 'Performance Quick-Dry Athletic Joggers',
    description: 'Four-way stretch moisture-wicking joggers with concealed zip security pockets.',
    category: 'Apparel',
    price: 78.00,
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-21T11:20:00Z')
  },
  {
    name: 'Classic Casual Linen Button-Down Shirt',
    description: 'Breezy washed linen shirt designed for casual summer elegance and breathable comfort.',
    category: 'Apparel',
    price: 68.00,
    rating: 3.8,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-23T14:10:00Z')
  },
  {
    name: 'Basic Polyester Promotional Hoodie',
    description: 'Thin polyester blend pullover hoodie with standard kangaroo front pocket.',
    category: 'Apparel',
    price: 24.99,
    rating: 2.8,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-26T08:30:00Z')
  },

  // --- FOOTWEAR (7 Products) ---
  {
    name: 'Nike Air Zoom Pegasus 40 Running Shoes',
    description: 'Responsive cushioning and tailored midfoot containment for runners at every level.',
    category: 'Footwear',
    price: 139.99,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-12T09:00:00Z')
  },
  {
    name: 'Red Wing Iron Ranger 6-Inch Heritage Boots',
    description: 'Iconic American handcrafted work boots with premium amber harness leather and Vibram soles.',
    category: 'Footwear',
    price: 349.99,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-14T12:40:00Z')
  },
  {
    name: 'Adidas Ultraboost Light Running Shoes',
    description: 'Light Boost midsole material delivering epic energy return across short and long strides.',
    category: 'Footwear',
    price: 189.95,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-17T17:00:00Z')
  },
  {
    name: 'Birkenstock Arizona Soft Footbed Suede Sandals',
    description: 'Timeless two-strap leather sandals with contoured cork-latex footbed and arch support.',
    category: 'Footwear',
    price: 140.00,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-20T10:20:00Z')
  },
  {
    name: 'Vans Old Skool Classic Skate Shoes',
    description: 'Durable suede and canvas uppers with signature sidestripe and vulcanized waffle outsole.',
    category: 'Footwear',
    price: 70.00,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-22T13:15:00Z')
  },
  {
    name: 'Cole Haan Grand Crosscourt Knit Sneakers',
    description: 'Lightweight sport-casual knit oxford sneakers with cushioned EVA footbed.',
    category: 'Footwear',
    price: 95.00,
    rating: 3.9,
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-24T15:45:00Z')
  },
  {
    name: 'Casual Foam Pool Slide Slippers',
    description: 'Basic lightweight EVA foam slip-on sandals for gym and shower use.',
    category: 'Footwear',
    price: 15.99,
    rating: 3.1,
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-27T11:00:00Z')
  },

  // --- HOME & KITCHEN (7 Products) ---
  {
    name: 'Breville Barista Touch Espresso Machine',
    description: 'Automated touchscreen interface with integrated conical burr grinder and automatic microfoam steam.',
    category: 'Home & Kitchen',
    price: 999.95,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-10T14:30:00Z')
  },
  {
    name: 'Le Creuset Enameled Cast Iron Signature Round Dutch Oven (5.5 Qt)',
    description: 'Superior heat distribution and retention with colorful, durable chip-resistant enamel.',
    category: 'Home & Kitchen',
    price: 420.00,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-13T11:15:00Z')
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    description: 'Laser illumination reveals invisible microscopic dust on hard floors with high-torque cleaner head.',
    category: 'Home & Kitchen',
    price: 749.99,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-15T16:20:00Z')
  },
  {
    name: 'Fellow Stagg EKG Electric Pour-Over Kettle',
    description: 'Precision temperature control to the degree, variable PID controller, and ergonomic counterbalanced handle.',
    category: 'Home & Kitchen',
    price: 165.00,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-18T10:00:00Z')
  },
  {
    name: 'Ninja Foodi 6-in-1 8-Qt 2-Basket Air Fryer',
    description: 'DualZone technology with 2 independent baskets to cook 2 foods, 2 ways simultaneously.',
    category: 'Home & Kitchen',
    price: 179.99,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-21T09:40:00Z')
  },
  {
    name: 'Stainless Steel Measuring Cups & Spoons Set',
    description: 'Heavy-gauge brushed stainless steel measuring set with laser-etched metric markings.',
    category: 'Home & Kitchen',
    price: 29.99,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-23T12:00:00Z')
  },
  {
    name: 'Non-Stick Silicone Basting Pastry Brush',
    description: 'Single piece heat-resistant food-grade silicone oil brush for baking and barbecues.',
    category: 'Home & Kitchen',
    price: 9.99,
    rating: 3.3,
    image: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-25T15:20:00Z')
  },

  // --- ACCESSORIES (7 Products) ---
  {
    name: 'Bellroy Transit Backpack 28L Water-Resistant Work Bag',
    description: 'Dedicated laptop section, quick-access accessory pockets, and breathable contoured foam back panel.',
    category: 'Accessories',
    price: 239.00,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-11T13:30:00Z')
  },
  {
    name: 'Ray-Ban Classic Polarized Wayfarer Sunglasses',
    description: 'Legendary G-15 polarized crystal green lenses offering 100% UV protection with acetate frame.',
    category: 'Accessories',
    price: 210.00,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-14T08:50:00Z')
  },
  {
    name: 'Fossil Minimalist Stainless Steel Chronograph Watch',
    description: 'Slim 44mm black satin dial with genuine brown leather strap and quartz movement.',
    category: 'Accessories',
    price: 130.00,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-17T11:10:00Z')
  },
  {
    name: 'Ridge Minimalist Slim RFID-Blocking Metal Wallet',
    description: 'Grade 5 aerospace aluminum plates holding 1-12 cards without stretching out.',
    category: 'Accessories',
    price: 95.00,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-19T14:00:00Z')
  },
  {
    name: 'Hydro Flask 32 oz Wide Mouth Vacuum Insulated Bottle',
    description: 'TempShield double-wall insulation keeps drinks icy cold for 24 hours or steaming hot for 12.',
    category: 'Accessories',
    price: 44.95,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-22T09:15:00Z')
  },
  {
    name: 'Full-Grain Italian Leather Dress Belt',
    description: 'Handcrafted genuine bridle leather belt with solid brushed nickel buckle.',
    category: 'Accessories',
    price: 55.00,
    rating: 4.0,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-24T16:00:00Z')
  },
  {
    name: 'Universal Neoprene Sunglass Cord Retainer',
    description: 'Simple adjustable strap to secure eyewear around neck during sports activities.',
    category: 'Accessories',
    price: 7.99,
    rating: 2.9,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date('2026-01-26T14:40:00Z')
  }
];

/**
 * Seed function to populate MongoDB with test data
 */
export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Purging existing products...');
    await Product.deleteMany({});

    console.log(`[Seed] Inserting ${realisticProducts.length} realistic products...`);
    const inserted = await Product.insertMany(realisticProducts);

    console.log(`[Seed] Successfully seeded ${inserted.length} products across all 5 categories!`);

    // Output category count summary
    const summary = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n--- Seeding Summary ---');
    summary.forEach((item) => {
      console.log(`• ${item._id}: ${item.count} items (Avg Price: $${item.avgPrice.toFixed(2)})`);
    });
    console.log('------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Seeding failed with error:', error);
    process.exit(1);
  }
};

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith('seedProducts.js')) {
  seedDatabase();
}
