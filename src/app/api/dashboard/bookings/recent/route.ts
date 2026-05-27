import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, courts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const tenantId = 'tnt_1';

    // Join bookings with courts to get court name
    const recent = await db
      .select({
        id: bookings.id,
        customerName: bookings.customerName,
        courtName: courts.name,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
      })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .where(eq(bookings.tenantId, tenantId))
      .orderBy(desc(bookings.createdAt))
      .limit(5);

    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    });

    const formattedRecent = recent.map((b) => ({
      id: b.id,
      customer: b.customerName,
      court: b.courtName,
      time: `${b.startTime} - ${b.endTime}`,
      status: b.status,
      amount: formatter.format(b.totalPrice),
    }));

    return NextResponse.json(formattedRecent);
  } catch (error) {
    console.error('Failed to fetch recent bookings', error);
    return NextResponse.json({ error: 'Failed to fetch recent bookings' }, { status: 500 });
  }
}
