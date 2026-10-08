import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with enhanced schema...');

  // Clear existing data in reverse order of foreign keys
  await prisma.userCoupon.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  console.log('🧹 Existing data cleaned.');

  // 1. Create Users (bcrypt 12 rounds)
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 12);
  const userPasswordHash = await bcrypt.hash('User@123456', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@store.com',
      phone: '+1 (555) 000-0001',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });

  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@store.com',
      phone: '+1 (555) 234-5678',
      passwordHash: userPasswordHash,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@store.com',
      phone: '+1 (555) 987-6543',
      passwordHash: userPasswordHash,
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
  });

  console.log('👤 Created demo users: admin@store.com, john@store.com, jane@store.com');

  // 2. Addresses
  const johnAddress = await prisma.address.create({
    data: {
      userId: john.id,
      fullName: 'John Doe',
      phone: '+1 (555) 234-5678',
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
      country: 'United States',
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: jane.id,
      fullName: 'Jane Smith',
      phone: '+1 (555) 987-6543',
      street: '123 Market Street, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
      country: 'United States',
      isDefault: true,
    },
  });

  // 3. Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Cutting-edge consumer tech, computers, smartphones, and accessories',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Audio',
        slug: 'audio',
        description: 'Premium headphones, studio monitors, earbuds, and home audio systems',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Footwear',
        slug: 'footwear',
        description: 'Performance running shoes, lifestyle sneakers, and designer boots',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Gaming',
        slug: 'gaming',
        description: 'Consoles, high-precision controllers, mechanical keyboards, and gaming gear',
        imageUrl: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Contemporary streetwear, outerwear, essentials, and luxury apparel',
        imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        description: 'Smart kitchen appliances, modern home decor, and coffee gear',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
      },
    }),
  ]);

  const [catElectronics, catAudio, catFootwear, catGaming, catFashion, catHome] = categories;

  // 4. Brands
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Apple',
        slug: 'apple',
        logoUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Sony',
        slug: 'sony',
        logoUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Nike',
        slug: 'nike',
        logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Samsung',
        slug: 'samsung',
        logoUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Bose',
        slug: 'bose',
        logoUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Logitech',
        slug: 'logitech',
        logoUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=200&q=80',
      },
    }),
  ]);

  const [brandApple, brandSony, brandNike, brandSamsung, brandBose, brandLogitech] = brands;

  console.log('🏷️ Created categories and brands');

  // 5. Products Catalog
  const productsData = [
    {
      name: 'MacBook Pro 16" M3 Max',
      slug: 'macbook-pro-16-m3-max',
      description: 'The ultimate pro laptop. With M3 Max, a stunning Liquid Retina XDR display, up to 22 hours of battery life, and pro ports.',
      shortDescription: '16-inch Liquid Retina XDR, M3 Max 16-Core CPU, 40-Core GPU.',
      price: 3499.0,
      compareAtPrice: 3899.0,
      sku: 'APL-MBP-16-M3M',
      stock: 24,
      categoryId: catElectronics.id,
      brandId: brandApple.id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 42,
      specifications: JSON.stringify({
        Processor: 'Apple M3 Max (16-core)',
        Display: '16.2-inch Liquid Retina XDR 120Hz',
        Memory: '36GB Unified Memory',
        Storage: '1TB Superfast SSD',
        Battery: 'Up to 22 hours',
        Weight: '4.8 lbs (2.16 kg)',
      }),
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Space Black / 36GB / 1TB', sku: 'MBP16-SB-36-1T', priceAdjustment: 0, stock: 14, attributes: JSON.stringify({ Color: 'Space Black', Storage: '1TB' }) },
        { name: 'Silver / 48GB / 2TB', sku: 'MBP16-SL-48-2T', priceAdjustment: 600, stock: 10, attributes: JSON.stringify({ Color: 'Silver', Storage: '2TB' }) },
      ],
    },
    {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      slug: 'sony-wh-1000xm5-wireless-headphones',
      description: 'Industry-leading noise cancellation optimized with two processors and 8 microphones for unparalleled calls and sound fidelity.',
      shortDescription: 'Wireless noise canceling with Auto NC Optimizer and 30-hour battery life.',
      price: 398.0,
      compareAtPrice: 449.0,
      sku: 'SNY-WH-1000XM5',
      stock: 45,
      categoryId: catAudio.id,
      brandId: brandSony.id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 128,
      specifications: JSON.stringify({
        Driver: '30mm precision engineered carbon fiber',
        Battery: '30 hours with ANC on',
        Connectivity: 'Bluetooth 5.2, Multipoint, 3.5mm jack',
        Weight: '250 grams',
      }),
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Midnight Black', sku: 'WH5-BLK', priceAdjustment: 0, stock: 25, attributes: JSON.stringify({ Color: 'Black' }) },
        { name: 'Platinum Silver', sku: 'WH5-SLV', priceAdjustment: 0, stock: 20, attributes: JSON.stringify({ Color: 'Silver' }) },
      ],
    },
    {
      name: 'Nike Air Zoom Pegasus 40',
      slug: 'nike-air-zoom-pegasus-40',
      description: 'A springy ride for any run, the familiar feel of the Peg returns to help you accomplish your personal goals with responsive React foam.',
      shortDescription: 'Neutral everyday running shoe with dual Zoom Air units.',
      price: 130.0,
      compareAtPrice: 150.0,
      sku: 'NKE-PEG-40',
      stock: 80,
      categoryId: catFootwear.id,
      brandId: brandNike.id,
      isFeatured: true,
      rating: 4.7,
      reviewCount: 95,
      specifications: JSON.stringify({
        Cushioning: 'Dual Zoom Air + Nike React foam',
        Drop: '10mm',
        Upper: 'Single layer engineered mesh',
        Weight: '10.1 oz (Men size 10)',
      }),
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Size 9 / Crimson Red', sku: 'PEG40-RED-9', priceAdjustment: 0, stock: 20, attributes: JSON.stringify({ Size: '9', Color: 'Crimson Red' }) },
        { name: 'Size 10 / Crimson Red', sku: 'PEG40-RED-10', priceAdjustment: 0, stock: 35, attributes: JSON.stringify({ Size: '10', Color: 'Crimson Red' }) },
        { name: 'Size 11 / Black & White', sku: 'PEG40-BLK-11', priceAdjustment: 0, stock: 25, attributes: JSON.stringify({ Size: '11', Color: 'Black/White' }) },
      ],
    },
    {
      name: 'Samsung Galaxy S24 Ultra 5G',
      slug: 'samsung-galaxy-s24-ultra-5g',
      description: 'Meet Galaxy S24 Ultra, with a durable titanium exterior and a 6.8-inch flat display with Galaxy AI built right in.',
      shortDescription: 'Galaxy AI, 200MP Quad Telephoto camera, Snapdragon 8 Gen 3.',
      price: 1299.0,
      compareAtPrice: 1419.0,
      sku: 'SAM-S24U-512',
      stock: 30,
      categoryId: catElectronics.id,
      brandId: brandSamsung.id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 64,
      specifications: JSON.stringify({
        Display: '6.8" Dynamic AMOLED 2X, 120Hz 2600 nits',
        Camera: '200MP Main + 50MP 5x + 10MP 3x + 12MP Ultra-wide',
        Battery: '5000 mAh with 45W fast charging',
        Materials: 'Titanium frame, Gorilla Armor glass',
      }),
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Titanium Gray / 256GB', sku: 'S24U-GRY-256', priceAdjustment: 0, stock: 15, attributes: JSON.stringify({ Color: 'Titanium Gray', Storage: '256GB' }) },
        { name: 'Titanium Black / 512GB', sku: 'S24U-BLK-512', priceAdjustment: 150, stock: 15, attributes: JSON.stringify({ Color: 'Titanium Black', Storage: '512GB' }) },
      ],
    },
    {
      name: 'Sony PlayStation 5 Pro Console',
      slug: 'sony-playstation-5-pro-console',
      description: 'Witness upgraded graphic fidelity with PlayStation Spectral Super Resolution (PSSR), 2TB SSD, and advanced ray tracing.',
      shortDescription: 'PlayStation Spectral Super Resolution (PSSR), 2TB SSD, Wi-Fi 7.',
      price: 699.99,
      compareAtPrice: 749.99,
      sku: 'SNY-PS5-PRO',
      stock: 18,
      categoryId: catGaming.id,
      brandId: brandSony.id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 88,
      specifications: JSON.stringify({
        GPU: 'Upgraded RDNA Architecture with 67% more compute units',
        Storage: '2TB Custom High-Speed NVMe SSD',
        Resolution: 'Up to 8K / 4K 120Hz HDR',
        Audio: 'Tempest 3D AudioTech',
      }),
      images: [
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Standard 2TB Edition', sku: 'PS5PRO-2TB', priceAdjustment: 0, stock: 18, attributes: JSON.stringify({ Edition: 'Digital Pro 2TB' }) },
      ],
    },
    {
      name: 'Bose QuietComfort Ultra Earbuds',
      slug: 'bose-quietcomfort-ultra-earbuds',
      description: 'Breakthrough spatialized audio for more immersive listening. World-class noise cancellation that is quieter than ever before.',
      shortDescription: 'Spatialized Bose Immersive Audio and CustomTune technology.',
      price: 299.0,
      compareAtPrice: 329.0,
      sku: 'BOS-QCU-EAR',
      stock: 55,
      categoryId: catAudio.id,
      brandId: brandBose.id,
      isFeatured: false,
      rating: 4.6,
      reviewCount: 52,
      specifications: JSON.stringify({
        Microphones: '9 microphones total across both buds',
        Playtime: 'Up to 6 hours (24 hours total with case)',
        Waterproof: 'IPX4 sweat and water resistant',
      }),
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Black', sku: 'QCU-BLK', priceAdjustment: 0, stock: 30, attributes: JSON.stringify({ Color: 'Black' }) },
        { name: 'White Smoke', sku: 'QCU-WHT', priceAdjustment: 0, stock: 25, attributes: JSON.stringify({ Color: 'White Smoke' }) },
      ],
    },
    {
      name: 'Logitech MX Master 3S Wireless Mouse',
      slug: 'logitech-mx-master-3s-mouse',
      description: 'An icon remastered. Feel every moment of your workflow with even more precision, tactility, and performance, thanks to Quiet Clicks.',
      shortDescription: '8K DPI any-surface tracking and 90% quieter clicks.',
      price: 99.99,
      compareAtPrice: 119.99,
      sku: 'LOG-MXM-3S',
      stock: 60,
      categoryId: catElectronics.id,
      brandId: brandLogitech.id,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 210,
      specifications: JSON.stringify({
        Sensor: 'Darkfield high precision 8000 DPI',
        Scroll: 'MagSpeed electromagnetic scrolling',
        Battery: '500 mAh rechargeable, up to 70 days',
      }),
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Graphite', sku: 'MXM3S-GRP', priceAdjustment: 0, stock: 35, attributes: JSON.stringify({ Color: 'Graphite' }) },
        { name: 'Pale Gray', sku: 'MXM3S-GRY', priceAdjustment: 0, stock: 25, attributes: JSON.stringify({ Color: 'Pale Gray' }) },
      ],
    },
    {
      name: 'Logitech G PRO X TKL Mechanical Keyboard',
      slug: 'logitech-g-pro-x-tkl-keyboard',
      description: 'The next generation of the championship-winning keyboard, co-designed with world-class esports athletes for LIGHTSPEED wireless speed.',
      shortDescription: 'LIGHTSPEED Wireless, GX Linear Switches, Dual-shot PBT keycaps.',
      price: 199.99,
      compareAtPrice: 229.99,
      sku: 'LOG-GPRO-TKL',
      stock: 40,
      categoryId: catGaming.id,
      brandId: brandLogitech.id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 76,
      specifications: JSON.stringify({
        Switches: 'GX Red Linear Mechanical',
        Lighting: 'LIGHTSYNC RGB per-key',
        Battery: 'Up to 50 hours battery life',
      }),
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Black / Linear Red', sku: 'GPRO-BLK-RED', priceAdjustment: 0, stock: 25, attributes: JSON.stringify({ Color: 'Black', Switch: 'Red Linear' }) },
        { name: 'White / Tactile Brown', sku: 'GPRO-WHT-BRN', priceAdjustment: 0, stock: 15, attributes: JSON.stringify({ Color: 'White', Switch: 'Tactile Brown' }) },
      ],
    },
    {
      name: 'Nike Sportswear Tech Fleece Windrunner',
      slug: 'nike-tech-fleece-windrunner',
      description: 'Smooth on both sides, this premium fleece feels warmer and softer than ever, while keeping that lightweight build you love.',
      shortDescription: 'Full-zip hoodie engineered with lightweight insulating Tech Fleece.',
      price: 145.0,
      compareAtPrice: 165.0,
      sku: 'NKE-TECH-FLC',
      stock: 50,
      categoryId: catFashion.id,
      brandId: brandNike.id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 68,
      specifications: JSON.stringify({
        Material: '53% Cotton, 47% Polyester',
        Fit: 'Standard fit for a relaxed, easy feel',
        Care: 'Machine wash cold',
      }),
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Medium / Heather Gray', sku: 'TF-GRY-M', priceAdjustment: 0, stock: 20, attributes: JSON.stringify({ Size: 'M', Color: 'Heather Gray' }) },
        { name: 'Large / Black', sku: 'TF-BLK-L', priceAdjustment: 0, stock: 30, attributes: JSON.stringify({ Size: 'L', Color: 'Black' }) },
      ],
    },
    {
      name: 'Apple Watch Ultra 2 (Titanium)',
      slug: 'apple-watch-ultra-2',
      description: 'The most rugged and capable Apple Watch. Designed for outdoor endurance, ocean adventures, and precision fitness metrics.',
      shortDescription: '49mm aerospace-grade titanium case with up to 3000 nits display.',
      price: 799.0,
      compareAtPrice: 849.0,
      sku: 'APL-WCH-ULT2',
      stock: 22,
      categoryId: catElectronics.id,
      brandId: brandApple.id,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 57,
      specifications: JSON.stringify({
        Case: '49mm Titanium with sapphire crystal front',
        Display: 'Always-On Retina up to 3000 nits',
        WaterResistance: '100m water resistant & EN13319 dive rated',
      }),
      images: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Orange Ocean Band', sku: 'WULT2-ORG', priceAdjustment: 0, stock: 12, attributes: JSON.stringify({ Band: 'Orange Ocean' }) },
        { name: 'Blue Trail Loop', sku: 'WULT2-BLU', priceAdjustment: 0, stock: 10, attributes: JSON.stringify({ Band: 'Blue Trail Loop' }) },
      ],
    },
    {
      name: 'Sony A7 IV Full-Frame Mirrorless Camera',
      slug: 'sony-a7-iv-mirrorless-camera',
      description: 'Groundbreaking performance in both still and movie recording, the a7 IV is the ideal hybrid camera with 33MP Exmor R CMOS.',
      shortDescription: '33MP full-frame Exmor R BSI CMOS sensor with 4K 60p 10-bit recording.',
      price: 2498.0,
      compareAtPrice: 2698.0,
      sku: 'SNY-ILCE-7M4',
      stock: 12,
      categoryId: catElectronics.id,
      brandId: brandSony.id,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 43,
      specifications: JSON.stringify({
        Sensor: '33MP Full-Frame Exmor R CMOS',
        Video: '4K 60p in 10-Bit 4:2:2',
        AF: '759 phase-detection points with Real-time Eye AF',
      }),
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Body Only', sku: 'A7M4-BODY', priceAdjustment: 0, stock: 8, attributes: JSON.stringify({ Package: 'Body Only' }) },
        { name: 'With 28-70mm Lens Kit', sku: 'A7M4-KIT', priceAdjustment: 200, stock: 4, attributes: JSON.stringify({ Package: 'Lens Kit' }) },
      ],
    },
    {
      name: 'Bose SoundLink Revolve+ II Bluetooth Speaker',
      slug: 'bose-soundlink-revolve-plus-ii',
      description: 'Engineered to deliver true 360-degree sound for consistent, uniform coverage with seamless aluminum body and water resistance.',
      shortDescription: 'True 360-degree sound, durable water-resistant design with flexible handle.',
      price: 329.0,
      compareAtPrice: 349.0,
      sku: 'BOS-SL-REV2',
      stock: 35,
      categoryId: catAudio.id,
      brandId: brandBose.id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 65,
      specifications: JSON.stringify({
        Sound: 'Deep, loud and immersive 360 degree sound',
        Battery: 'Rechargeable lithium-ion up to 17 hours',
        Durability: 'IP55 dust and water resistance',
      }),
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Triple Black', sku: 'REV2-BLK', priceAdjustment: 0, stock: 20, attributes: JSON.stringify({ Color: 'Triple Black' }) },
        { name: 'Lux Silver', sku: 'REV2-SLV', priceAdjustment: 0, stock: 15, attributes: JSON.stringify({ Color: 'Lux Silver' }) },
      ],
    },
    {
      name: 'Nike Dunk Low Retro Panda',
      slug: 'nike-dunk-low-retro-panda',
      description: 'Created for the hardwood but taken to the streets, the 80s b-ball icon returns with perfectly shined overlays and classic colors.',
      shortDescription: 'Classic 80s basketball sneaker in iconic Black and White colorway.',
      price: 115.0,
      compareAtPrice: 135.0,
      sku: 'NKE-DNK-PND',
      stock: 75,
      categoryId: catFootwear.id,
      brandId: brandNike.id,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 310,
      specifications: JSON.stringify({
        Upper: 'Crisp leather upper that ages to soft perfection',
        Midsole: 'Foam cushioning for lightweight, responsive step',
        Outsole: 'Durable rubber outsole with classic hoops pivot circle',
      }),
      images: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Size 9 / Black & White', sku: 'DNK-9', priceAdjustment: 0, stock: 25, attributes: JSON.stringify({ Size: '9' }) },
        { name: 'Size 10 / Black & White', sku: 'DNK-10', priceAdjustment: 0, stock: 30, attributes: JSON.stringify({ Size: '10' }) },
        { name: 'Size 11 / Black & White', sku: 'DNK-11', priceAdjustment: 0, stock: 20, attributes: JSON.stringify({ Size: '11' }) },
      ],
    },
    {
      name: 'Samsung Odyssey OLED G9 49" Curved Gaming Monitor',
      slug: 'samsung-odyssey-oled-g9-gaming-monitor',
      description: 'Immerse in radiant OLED picture quality on a 49-inch 1800R curved screen with a blisteringly fast 0.03ms response time and 240Hz refresh.',
      shortDescription: 'Dual QHD OLED screen, 240Hz, 0.03ms, Neo Quantum Processor Pro.',
      price: 1799.99,
      compareAtPrice: 1999.99,
      sku: 'SAM-ODYS-G9',
      stock: 10,
      categoryId: catGaming.id,
      brandId: brandSamsung.id,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 39,
      specifications: JSON.stringify({
        Screen: '49-inch Dual QHD (5120 x 1440) 32:9 Aspect Ratio',
        RefreshRate: '240Hz with AMD FreeSync Premium Pro',
        ResponseTime: '0.03ms (GtG)',
        Curve: '1800R curvature',
      }),
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Silver 49-Inch Dual QHD', sku: 'G9-49-SLV', priceAdjustment: 0, stock: 10, attributes: JSON.stringify({ Size: '49 inch' }) },
      ],
    },
    {
      name: 'Apple iPad Pro 13" M4',
      slug: 'apple-ipad-pro-13-m4',
      description: 'The thinnest Apple product ever, featuring an outrageous breakthrough Ultra Retina XDR tandem OLED display and the cosmic M4 chip.',
      shortDescription: 'Tandem OLED Ultra Retina XDR display, M4 chip, Apple Pencil Pro support.',
      price: 1299.0,
      compareAtPrice: 1399.0,
      sku: 'APL-IPD-13-M4',
      stock: 28,
      categoryId: catElectronics.id,
      brandId: brandApple.id,
      isFeatured: false,
      rating: 4.9,
      reviewCount: 44,
      specifications: JSON.stringify({
        Chip: 'Apple M4 chip (9-core CPU, 10-core GPU)',
        Display: '13-inch Ultra Retina XDR (Tandem OLED) 120Hz ProMotion',
        Thickness: '5.1 mm ultra-thin profile',
      }),
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Space Black / 256GB / Wi-Fi', sku: 'IPD13-SB-256', priceAdjustment: 0, stock: 15, attributes: JSON.stringify({ Color: 'Space Black', Storage: '256GB' }) },
        { name: 'Silver / 512GB / Wi-Fi', sku: 'IPD13-SL-512', priceAdjustment: 200, stock: 13, attributes: JSON.stringify({ Color: 'Silver', Storage: '512GB' }) },
      ],
    },
    {
      name: 'Sony DualSense Edge Wireless Controller',
      slug: 'sony-dualsense-edge-controller',
      description: 'Get an edge in gameplay by creating your own custom controls. Built with high performance and personalization in mind.',
      shortDescription: 'Customizable controls, swappable stick modules, adjustable triggers.',
      price: 199.99,
      compareAtPrice: 219.99,
      sku: 'SNY-DS-EDGE',
      stock: 42,
      categoryId: catGaming.id,
      brandId: brandSony.id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 92,
      specifications: JSON.stringify({
        Features: 'Replaceable stick modules, remappable back buttons',
        Haptics: 'Haptic feedback and adaptive triggers',
        Case: 'Includes braided USB cable and hard carrying case',
      }),
      images: [
        'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'White & Black Standard', sku: 'DSEDGE-WHT', priceAdjustment: 0, stock: 42, attributes: JSON.stringify({ Color: 'White/Black' }) },
      ],
    },
    {
      name: 'Nike Air Force 1 07 Triple White',
      slug: 'nike-air-force-1-07-white',
      description: 'The radiance lives on with the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold details and just the right amount of flash.',
      shortDescription: 'Classic low-cut silhouette in clean all-white premium leather.',
      price: 115.0,
      compareAtPrice: 125.0,
      sku: 'NKE-AF1-WHT',
      stock: 90,
      categoryId: catFootwear.id,
      brandId: brandNike.id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 420,
      specifications: JSON.stringify({
        Upper: 'Stitched leather overlays for durability and heritage style',
        Cushioning: 'Nike Air cushioning designed for performance hoops',
        Colorway: 'White / White / White',
      }),
      images: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Size 9 / Triple White', sku: 'AF1-9', priceAdjustment: 0, stock: 30, attributes: JSON.stringify({ Size: '9' }) },
        { name: 'Size 10 / Triple White', sku: 'AF1-10', priceAdjustment: 0, stock: 35, attributes: JSON.stringify({ Size: '10' }) },
        { name: 'Size 11 / Triple White', sku: 'AF1-11', priceAdjustment: 0, stock: 25, attributes: JSON.stringify({ Size: '11' }) },
      ],
    },
    {
      name: 'Logitech StreamCam Full HD 1080p',
      slug: 'logitech-streamcam-full-hd',
      description: 'Take your streaming and video content to the next level with smooth 60 fps capture, smart auto-focus, and flexible mounting options.',
      shortDescription: 'Full HD 1080p at 60 fps with AI facial tracking and smart auto-exposure.',
      price: 169.99,
      compareAtPrice: 189.99,
      sku: 'LOG-STRM-CAM',
      stock: 32,
      categoryId: catElectronics.id,
      brandId: brandLogitech.id,
      isFeatured: false,
      rating: 4.6,
      reviewCount: 38,
      specifications: JSON.stringify({
        Video: '1080p / 60 fps in MJPEG',
        Lens: 'Premium Full HD Glass Lens f/2.0 - focal length 3.7 mm',
        Audio: 'Dual omnidirectional microphone with noise filter',
      }),
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Graphite', sku: 'STRM-GRP', priceAdjustment: 0, stock: 20, attributes: JSON.stringify({ Color: 'Graphite' }) },
        { name: 'White', sku: 'STRM-WHT', priceAdjustment: 0, stock: 12, attributes: JSON.stringify({ Color: 'White' }) },
      ],
    },
    {
      name: 'Samsung 65" Neo QLED 4K QN90D Smart TV',
      slug: 'samsung-65-neo-qled-4k-qn90d',
      description: 'See sensational contrast, vibrant color and incredible detail powered by Quantum Matrix with Mini LEDs and the NQ4 AI Gen2 Processor.',
      shortDescription: '65-inch Neo QLED 4K with Quantum Matrix Technology and Motion Xcelerator 144Hz.',
      price: 1899.99,
      compareAtPrice: 2299.99,
      sku: 'SAM-65-QN90D',
      stock: 8,
      categoryId: catElectronics.id,
      brandId: brandSamsung.id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 29,
      specifications: JSON.stringify({
        Display: '65" Neo QLED 4K (3840 x 2160) 144Hz',
        HDR: 'Neo Quantum HDR+',
        Audio: 'Dolby Atmos and Object Tracking Sound+ (OTS+)',
      }),
      images: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: '65-Inch Titanium Silver', sku: 'QN90D-65', priceAdjustment: 0, stock: 8, attributes: JSON.stringify({ ScreenSize: '65 inch' }) },
      ],
    },
    {
      name: 'Bose Smart Ultra Soundbar with Dolby Atmos',
      slug: 'bose-smart-ultra-soundbar',
      description: 'Feel immersive spatial audio like you are in the movie theater. Features Dolby Atmos and Bose TrueSpace technology for spatialized sound.',
      shortDescription: 'Top-tier smart soundbar with Dolby Atmos, AI Dialogue Mode, and voice assistant support.',
      price: 899.0,
      compareAtPrice: 999.0,
      sku: 'BOS-SNDBR-ULT',
      stock: 14,
      categoryId: catAudio.id,
      brandId: brandBose.id,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 47,
      specifications: JSON.stringify({
        Audio: 'Dolby Atmos, Dolby Digital, TrueSpace technology',
        Voice: 'Amazon Alexa & Google Assistant built-in',
        Inputs: 'HDMI eARC, optical audio, Wi-Fi, Bluetooth 5.0, AirPlay 2',
      }),
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { name: 'Black', sku: 'SNDBR-BLK', priceAdjustment: 0, stock: 9, attributes: JSON.stringify({ Color: 'Black' }) },
        { name: 'White', sku: 'SNDBR-WHT', priceAdjustment: 0, stock: 5, attributes: JSON.stringify({ Color: 'White' }) },
      ],
    },
  ];

  for (const p of productsData) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        sku: p.sku,
        stock: p.stock,
        categoryId: p.categoryId,
        brandId: p.brandId,
        isFeatured: p.isFeatured,
        rating: p.rating,
        reviewCount: p.reviewCount,
        specifications: p.specifications,
        images: {
          create: p.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            sortOrder: idx,
            altText: `${p.name} - view ${idx + 1}`,
          })),
        },
        variants: {
          create: p.variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            priceAdjustment: v.priceAdjustment,
            stock: v.stock,
            attributes: v.attributes,
          })),
        },
      },
    });
  }

  console.log(`📦 Seeded ${productsData.length} rich products with variants and galleries`);

  // 6. Coupons
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountAmount: 10,
      minOrderAmount: 50,
      maxDiscountAmount: 100,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2030-12-31'),
      usageLimit: 1000,
      usedCount: 14,
      perUserLimit: 1,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'SAVE20',
      discountType: 'FIXED',
      discountAmount: 20,
      minOrderAmount: 100,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2030-12-31'),
      usageLimit: 500,
      usedCount: 22,
      perUserLimit: 1,
      isActive: true,
    },
  });

  console.log('🎟️ Seeded promotional coupons: WELCOME10, SAVE20');

  // 7. Seed sample past orders with snapshot and history
  const firstProduct = await prisma.product.findFirst({ where: { slug: 'sony-wh-1000xm5-wireless-headphones' } });
  const secondProduct = await prisma.product.findFirst({ where: { slug: 'nike-air-zoom-pegasus-40' } });

  if (firstProduct && secondProduct) {
    const addressSnapshot = JSON.stringify(johnAddress);

    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2026-90412',
        userId: john.id,
        shippingAddressId: johnAddress.id,
        shippingAddressSnapshot: addressSnapshot,
        subtotal: 528.0,
        discountAmount: 52.8,
        shippingAmount: 0.0,
        taxAmount: 38.01,
        totalAmount: 513.21,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        trackingNumber: 'TRK-US-981245890',
        couponCode: 'WELCOME10',
        createdAt: new Date('2026-09-15T14:30:00Z'),
        items: {
          create: [
            {
              productId: firstProduct.id,
              productName: firstProduct.name,
              unitPrice: firstProduct.price,
              quantity: 1,
              totalPrice: firstProduct.price,
            },
            {
              productId: secondProduct.id,
              productName: secondProduct.name,
              unitPrice: secondProduct.price,
              quantity: 1,
              totalPrice: secondProduct.price,
            },
          ],
        },
        payments: {
          create: {
            provider: 'STRIPE',
            transactionId: 'pi_test_simulated_90412',
            amount: 513.21,
            currency: 'USD',
            status: 'PAID',
          },
        },
        statusHistory: {
          create: [
            { status: 'PENDING', note: 'Order placed by customer', changedBy: 'CUSTOMER', createdAt: new Date('2026-09-15T14:30:00Z') },
            { status: 'CONFIRMED', note: 'Payment verified via Stripe', changedBy: 'PAYMENT_GATEWAY', createdAt: new Date('2026-09-15T14:32:00Z') },
            { status: 'PROCESSING', note: 'Picked and packed at fulfillment warehouse', changedBy: 'WAREHOUSE', createdAt: new Date('2026-09-16T09:00:00Z') },
            { status: 'SHIPPED', note: 'Carrier picked up package', changedBy: 'LOGISTICS', createdAt: new Date('2026-09-16T18:00:00Z') },
            { status: 'DELIVERED', note: 'Package delivered at front door', changedBy: 'CARRIER', createdAt: new Date('2026-09-18T13:45:00Z') },
          ],
        },
      },
    });

    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2026-90875',
        userId: john.id,
        shippingAddressId: johnAddress.id,
        shippingAddressSnapshot: addressSnapshot,
        subtotal: 99.99,
        discountAmount: 0.0,
        shippingAmount: 10.0,
        taxAmount: 8.8,
        totalAmount: 118.79,
        status: 'SHIPPED',
        paymentStatus: 'PAID',
        trackingNumber: 'TRK-FDX-774019283',
        createdAt: new Date('2026-10-02T10:15:00Z'),
        items: {
          create: [
            {
              productId: (await prisma.product.findFirst({ where: { slug: 'logitech-mx-master-3s-mouse' } }))?.id || firstProduct.id,
              productName: 'Logitech MX Master 3S Wireless Mouse',
              unitPrice: 99.99,
              quantity: 1,
              totalPrice: 99.99,
            },
          ],
        },
        payments: {
          create: {
            provider: 'STRIPE',
            transactionId: 'pi_test_simulated_90875',
            amount: 118.79,
            currency: 'USD',
            status: 'PAID',
          },
        },
        statusHistory: {
          create: [
            { status: 'PENDING', note: 'Order placed by customer', changedBy: 'CUSTOMER', createdAt: new Date('2026-10-02T10:15:00Z') },
            { status: 'CONFIRMED', note: 'Payment confirmed', changedBy: 'PAYMENT_GATEWAY', createdAt: new Date('2026-10-02T10:17:00Z') },
            { status: 'SHIPPED', note: 'In transit with FedEx', changedBy: 'LOGISTICS', createdAt: new Date('2026-10-03T11:00:00Z') },
          ],
        },
      },
    });

    // 8. Sample verified reviews
    await prisma.review.create({
      data: {
        productId: firstProduct.id,
        userId: john.id,
        rating: 5,
        title: 'Best noise cancellation I have ever experienced',
        comment: 'Wore these on a 14-hour cross-continental flight. Utter silence, incredible comfort, and battery still had 60% remaining when I landed.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });

    await prisma.review.create({
      data: {
        productId: secondProduct.id,
        userId: john.id,
        rating: 5,
        title: 'Daily running essential',
        comment: 'The Pegasus 40 has great arch support and just the right bounce for 5k-10k morning runs. Highly recommend!',
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });

    // 9. Initial Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'SYSTEM_INITIALIZE',
        entityType: 'StoreCatalog',
        entityId: 'global',
        details: JSON.stringify({ note: 'Initial catalog seeded with 20 products, categories, coupons and sample orders' }),
      },
    });

    console.log('✅ Created sample orders with status histories, verified reviews, and audit logs');
  }

  console.log('🎉 Seed process finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
