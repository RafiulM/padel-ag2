import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, courts, venues } from '@/db/schema';
import { eq, and, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const tenantId = 'tnt_1';
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const search = searchParams.get('search');

    // Build conditions
    const conditions = [eq(bookings.tenantId, tenantId)];
    if (status) conditions.push(eq(bookings.status, status));
    if (date) conditions.push(eq(bookings.bookingDate, date));

    let query = db
      .select({
        id: bookings.id,
        customerName: bookings.customerName,
        customerPhone: bookings.customerPhone,
        courtName: courts.name,
        venueName: venues.name,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        durationMinutes: bookings.durationMinutes,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .innerJoin(venues, eq(bookings.venueId, venues.id))
      .where(and(...conditions))
      .orderBy(desc(bookings.createdAt));

    let results = await query;

    // Client-side search filter (for simplicity in MVP)
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (b) =>
          b.id.toLowerCase().includes(searchLower) ||
          b.customerName.toLowerCase().includes(searchLower) ||
          b.customerPhone.includes(search)
      );
    }

    const formatter = new Intl.NumberFormat('id-ID');

    const formatted = results.map((b) => ({
      id: b.id,
      date: new Date(b.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: `${b.startTime} - ${b.endTime}`,
      customer: b.customerName,
      phone: b.customerPhone,
      court: b.courtName,
      venue: b.venueName,
      amount: b.totalPrice,
      status: b.status,
      notes: b.notes,
    }));

    // Compute summary stats
    const total = results.length;
    const pending = results.filter((b) => b.status === 'pending').length;
    const confirmed = results.filter((b) => b.status === 'confirmed').length;
    const cancelled = results.filter((b) => b.status === 'cancelled').length;
    const completed = results.filter((b) => b.status === 'completed').length;

    return NextResponse.json({
      bookings: formatted,
      summary: { total, pending, confirmed, cancelled, completed },
    });
  } catch (error) {
    console.error('Failed to fetch bookings', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = 'tnt_1';
    const body = await request.json();

    // Check for double booking
    const existing = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, body.courtId),
          eq(bookings.bookingDate, body.bookingDate),
          eq(bookings.startTime, body.startTime),
          or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending'))
        )
      );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'This slot is already booked' }, { status: 409 });
    }

    const newBooking = await db.insert(bookings).values({
      id: `BK-${Date.now()}`,
      tenantId,
      venueId: body.venueId,
      courtId: body.courtId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      bookingDate: body.bookingDate,
      startTime: body.startTime,
      endTime: body.endTime,
      durationMinutes: body.durationMinutes,
      totalPrice: body.totalPrice,
      status: 'pending',
      notes: body.notes || null,
      createdAt: new Date(),
    }).returning();

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create booking', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
