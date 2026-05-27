import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, courts } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const tenantId = 'tnt_1';
    const searchParams = request.nextUrl.searchParams;
    const venueId = searchParams.get('venueId');
    const courtId = searchParams.get('courtId');
    const weekStart = searchParams.get('weekStart'); // ISO date string, e.g., 2026-05-25

    if (!venueId || !weekStart) {
      return NextResponse.json({ error: 'venueId and weekStart are required' }, { status: 400 });
    }

    // Calculate week end (7 days from start)
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const endDateStr = endDate.toISOString().split('T')[0];

    // Build conditions
    const conditions = [
      eq(bookings.tenantId, tenantId),
      eq(bookings.venueId, venueId),
      gte(bookings.bookingDate, weekStart),
      lte(bookings.bookingDate, endDateStr),
    ];

    if (courtId && courtId !== 'all') {
      conditions.push(eq(bookings.courtId, courtId));
    }

    const weekBookings = await db
      .select({
        id: bookings.id,
        courtId: bookings.courtId,
        courtName: courts.name,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        customerName: bookings.customerName,
        status: bookings.status,
      })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .where(and(...conditions));

    // Group by date for the calendar grid
    const grouped: Record<string, Record<string, { court: string; status: string; customer: string; bookingId: string }>> = {};
    for (const b of weekBookings) {
      const dateKey = new Date(b.bookingDate).getDate().toString();
      if (!grouped[dateKey]) grouped[dateKey] = {};
      grouped[dateKey][b.startTime] = {
        court: b.courtName,
        status: b.status === 'cancelled' ? 'cancelled' : 'booked',
        customer: b.customerName.split(' ')[0] + ' ' + (b.customerName.split(' ')[1]?.[0] || '') + '.',
        bookingId: b.id,
      };
    }

    // Also fetch courts for this venue (for filter dropdown)
    const venueCourts = await db
      .select({ id: courts.id, name: courts.name })
      .from(courts)
      .where(eq(courts.venueId, venueId));

    return NextResponse.json({
      bookings: grouped,
      courts: venueCourts,
    });
  } catch (error) {
    console.error('Failed to fetch schedules', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}
