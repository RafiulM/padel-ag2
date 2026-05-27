import { db } from '../src/db';
import { users, tenants, venues, courts, courtAvailabilityRules, bookings, paymentInstructions } from '../src/db/schema';

async function main() {
  console.log('Seeding database...');

  // --- Users ---
  await db.insert(users).values({
    id: 'usr_1',
    name: 'Admin User',
    email: 'admin@padel.com',
    createdAt: new Date(),
  });

  // --- Tenants ---
  await db.insert(tenants).values({
    id: 'tnt_1',
    ownerUserId: 'usr_1',
    name: 'Gelora Padel',
    slug: 'gelora-padel',
    createdAt: new Date(),
  });

  // --- Venues ---
  await db.insert(venues).values([
    {
      id: 'V-001',
      tenantId: 'tnt_1',
      name: 'Gelora Padel Senayan',
      slug: 'gelora-padel-senayan',
      address: 'Jl. Gerbang Pemuda No.3, RT.1/RW.3, Gelora, Kecamatan Tanah Abang, Kota Jakarta Pusat',
      city: 'Jakarta Pusat',
      description: 'The premier padel destination in the heart of Jakarta. Experience world-class courts and facilities.',
      phoneWhatsapp: '+62 812-3456-7890',
      openTime: '06:00',
      closeTime: '23:00',
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=60',
      createdAt: new Date(),
    },
    {
      id: 'V-002',
      tenantId: 'tnt_1',
      name: 'Gelora Padel Kemang',
      slug: 'gelora-padel-kemang',
      address: 'Jl. Kemang Raya No. 12, Jakarta Selatan',
      city: 'Jakarta Selatan',
      description: 'A premium padel venue in the heart of Kemang with semi-indoor courts.',
      phoneWhatsapp: '+62 812-9876-5432',
      openTime: '07:00',
      closeTime: '22:00',
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34d8?w=800&auto=format&fit=crop&q=60',
      createdAt: new Date(),
    },
    {
      id: 'V-003',
      tenantId: 'tnt_1',
      name: 'Gelora Padel BSD (Coming Soon)',
      slug: 'gelora-padel-bsd',
      address: 'BSD City, Tangerang Selatan',
      city: 'Tangerang Selatan',
      description: 'Our newest location coming soon to BSD City.',
      phoneWhatsapp: '+62 811-1234-5678',
      openTime: '06:00',
      closeTime: '24:00',
      isActive: false,
      createdAt: new Date(),
    },
  ]);

  // --- Courts ---
  await db.insert(courts).values([
    { id: 'C-001', venueId: 'V-001', name: 'Court 1 - Indoor Pro', description: 'Indoor panoramic court', pricePerHour: 300000, isActive: true, createdAt: new Date() },
    { id: 'C-002', venueId: 'V-001', name: 'Court 2 - Indoor Pro', description: 'Indoor panoramic court', pricePerHour: 300000, isActive: true, createdAt: new Date() },
    { id: 'C-003', venueId: 'V-001', name: 'Court 3 - Outdoor', description: 'Outdoor standard court', pricePerHour: 200000, isActive: true, createdAt: new Date() },
    { id: 'C-004', venueId: 'V-001', name: 'Court 4 - VIP Panoramic', description: 'VIP panoramic court with premium amenities', pricePerHour: 500000, isActive: false, createdAt: new Date() },
    { id: 'C-005', venueId: 'V-002', name: 'Court A - Semi Indoor', description: 'Semi-indoor court', pricePerHour: 250000, isActive: true, createdAt: new Date() },
    { id: 'C-006', venueId: 'V-002', name: 'Court B - Semi Indoor', description: 'Semi-indoor court', pricePerHour: 250000, isActive: true, createdAt: new Date() },
  ]);

  // --- Court Availability Rules (for all active courts, Mon-Sun, 90 min slots) ---
  const activeCourts = ['C-001', 'C-002', 'C-003', 'C-005', 'C-006'];
  const ruleValues = [];
  let ruleCounter = 1;
  for (const courtId of activeCourts) {
    for (let day = 0; day <= 6; day++) {
      ruleValues.push({
        id: `rule_${ruleCounter++}`,
        courtId,
        dayOfWeek: day,
        startTime: courtId.startsWith('C-00') ? '06:00' : '07:00', // Senayan starts 6am, Kemang 7am
        endTime: courtId.startsWith('C-00') ? '23:00' : '22:00',
        slotDurationMinutes: 90,
        isActive: true,
      });
    }
  }
  await db.insert(courtAvailabilityRules).values(ruleValues);

  // --- Payment Instructions ---
  await db.insert(paymentInstructions).values([
    {
      id: 'pi_1',
      tenantId: 'tnt_1',
      venueId: null,
      method: 'bank_transfer',
      accountName: 'PT PadelSpace Indonesia',
      accountNumber: '1234567890',
      bankName: 'BCA',
      instructions: 'Transfer the exact amount to the account above. Include your Booking ID in the transfer notes.',
      isActive: true,
    },
    {
      id: 'pi_2',
      tenantId: 'tnt_1',
      venueId: null,
      method: 'qris',
      accountName: 'Gelora Padel',
      accountNumber: 'QRIS-001',
      qrisImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
      instructions: 'Scan the QRIS code above using any e-wallet or mobile banking app.',
      isActive: true,
    },
  ]);

  // --- Bookings (varied dates/statuses for realistic data) ---
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

  await db.insert(bookings).values([
    // Today's bookings
    { id: 'BK-1029', tenantId: 'tnt_1', venueId: 'V-001', courtId: 'C-001', customerName: 'Budi Santoso', customerPhone: '+62 812-3456-7890', bookingDate: todayStr, startTime: '14:00', endTime: '15:30', durationMinutes: 90, totalPrice: 450000, status: 'confirmed', createdAt: new Date() },
    { id: 'BK-1030', tenantId: 'tnt_1', venueId: 'V-001', courtId: 'C-003', customerName: 'Andi Wijaya', customerPhone: '+62 811-9876-5432', bookingDate: todayStr, startTime: '16:00', endTime: '18:00', durationMinutes: 120, totalPrice: 400000, status: 'pending', createdAt: new Date() },
    { id: 'BK-1031', tenantId: 'tnt_1', venueId: 'V-001', courtId: 'C-001', customerName: 'Siti Aminah', customerPhone: '+62 856-1234-5678', bookingDate: todayStr, startTime: '18:30', endTime: '20:00', durationMinutes: 90, totalPrice: 450000, status: 'confirmed', createdAt: new Date() },
    { id: 'BK-1032', tenantId: 'tnt_1', venueId: 'V-002', courtId: 'C-005', customerName: 'Reza Rahardian', customerPhone: '+62 813-5555-6666', bookingDate: todayStr, startTime: '19:00', endTime: '21:00', durationMinutes: 120, totalPrice: 500000, status: 'cancelled', createdAt: new Date() },
    { id: 'BK-1033', tenantId: 'tnt_1', venueId: 'V-001', courtId: 'C-003', customerName: 'Dewi Lestari', customerPhone: '+62 812-9999-8888', bookingDate: todayStr, startTime: '20:00', endTime: '22:00', durationMinutes: 120, totalPrice: 400000, status: 'confirmed', createdAt: new Date() },
    // Tomorrow's bookings
    { id: 'BK-1034', tenantId: 'tnt_1', venueId: 'V-001', courtId: 'C-001', customerName: 'Joko Anwar', customerPhone: '+62 811-2222-3333', bookingDate: tomorrowStr, startTime: '08:00', endTime: '10:00', durationMinutes: 120, totalPrice: 600000, status: 'pending', createdAt: new Date() },
    { id: 'BK-1035', tenantId: 'tnt_1', venueId: 'V-001', courtId: 'C-002', customerName: 'Maya Karin', customerPhone: '+62 812-7777-8888', bookingDate: tomorrowStr, startTime: '09:00', endTime: '10:30', durationMinutes: 90, totalPrice: 450000, status: 'confirmed', createdAt: new Date() },
    { id: 'BK-1036', tenantId: 'tnt_1', venueId: 'V-002', courtId: 'C-006', customerName: 'Farhan Rizki', customerPhone: '+62 815-3333-4444', bookingDate: tomorrowStr, startTime: '16:00', endTime: '17:30', durationMinutes: 90, totalPrice: 375000, status: 'pending', createdAt: new Date() },
    // Yesterday's bookings (completed)
    { id: 'BK-1027', tenantId: 'tnt_1', venueId: 'V-001', courtId: 'C-001', customerName: 'Ahmad Dahlan', customerPhone: '+62 812-1111-2222', bookingDate: yesterdayStr, startTime: '08:00', endTime: '09:30', durationMinutes: 90, totalPrice: 450000, status: 'completed', createdAt: new Date(yesterday) },
    { id: 'BK-1028', tenantId: 'tnt_1', venueId: 'V-001', courtId: 'C-002', customerName: 'Linda Sari', customerPhone: '+62 813-4444-5555', bookingDate: yesterdayStr, startTime: '10:00', endTime: '12:00', durationMinutes: 120, totalPrice: 600000, status: 'completed', createdAt: new Date(yesterday) },
    // Two days ago
    { id: 'BK-1025', tenantId: 'tnt_1', venueId: 'V-002', courtId: 'C-005', customerName: 'Dian Sastro', customerPhone: '+62 812-6666-7777', bookingDate: twoDaysAgoStr, startTime: '14:00', endTime: '15:30', durationMinutes: 90, totalPrice: 375000, status: 'completed', createdAt: new Date(twoDaysAgo) },
    { id: 'BK-1026', tenantId: 'tnt_1', venueId: 'V-001', courtId: 'C-003', customerName: 'Rangga Putra', customerPhone: '+62 815-8888-9999', bookingDate: twoDaysAgoStr, startTime: '18:00', endTime: '20:00', durationMinutes: 120, totalPrice: 400000, status: 'completed', createdAt: new Date(twoDaysAgo) },
  ]);

  console.log('Seeding finished.');
}

main().catch((err) => {
  console.error('Failed to seed', err);
  process.exit(1);
});
