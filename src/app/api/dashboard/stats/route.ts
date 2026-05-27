import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, gte, and } from 'drizzle-orm';

export async function GET() {
  try {
    // For MVP, we assume tenant 'tnt_1'.
    // In production, get tenantId from session.
    const tenantId = 'tnt_1';

    const allBookings = await db.select().from(bookings).where(eq(bookings.tenantId, tenantId));

    const todayStr = new Date().toISOString().split('T')[0];

    const todaysBookings = allBookings.filter((b) => b.bookingDate === todayStr).length;
    const upcomingBookings = allBookings.filter((b) => b.bookingDate >= todayStr && b.status !== 'cancelled').length;
    const estimatedRevenue = allBookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((acc, curr) => acc + curr.totalPrice, 0);
    const pendingPayments = allBookings.filter((b) => b.status === 'pending').length;

    // Format revenue
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    });
    
    // Create an abbreviated view (e.g., Rp 4.2M)
    const formattedRevenue = estimatedRevenue >= 1000000 
      ? `Rp ${(estimatedRevenue / 1000000).toFixed(1)}M` 
      : formatter.format(estimatedRevenue);

    return NextResponse.json({
      todaysBookings,
      upcomingBookings,
      estimatedRevenue: formattedRevenue,
      pendingPayments,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
