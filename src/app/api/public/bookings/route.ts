import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, courts, venues, paymentInstructions } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { courtId, bookingDate, startTime, endTime, durationMinutes, customerName, customerPhone, notes } = body;

    if (!courtId || !bookingDate || !startTime || !endTime || !customerName || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the court and its venue + tenant
    const court = await db
      .select({
        id: courts.id,
        venueId: courts.venueId,
        pricePerHour: courts.pricePerHour,
        tenantId: venues.tenantId,
      })
      .from(courts)
      .innerJoin(venues, eq(courts.venueId, venues.id))
      .where(eq(courts.id, courtId))
      .limit(1);

    if (court.length === 0) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    const courtData = court[0];

    // Check for double booking
    const existing = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, courtId),
          eq(bookings.bookingDate, bookingDate),
          or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending'))
        )
      );

    // Check time overlap
    const [newStartH, newStartM] = startTime.split(':').map(Number);
    const [newEndH, newEndM] = endTime.split(':').map(Number);
    const newStartMins = newStartH * 60 + newStartM;
    const newEndMins = newEndH * 60 + newEndM;

    for (const b of existing) {
      const [bStartH, bStartM] = b.startTime.split(':').map(Number);
      const [bEndH, bEndM] = b.endTime.split(':').map(Number);
      const bStartMins = bStartH * 60 + bStartM;
      const bEndMins = bEndH * 60 + bEndM;

      if (newStartMins < bEndMins && newEndMins > bStartMins) {
        return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
      }
    }

    // Calculate price
    const duration = durationMinutes || (newEndMins - newStartMins);
    const totalPrice = Math.round((courtData.pricePerHour / 60) * duration);

    const bookingId = `BK-${Date.now()}`;

    const newBooking = await db.insert(bookings).values({
      id: bookingId,
      tenantId: courtData.tenantId,
      venueId: courtData.venueId,
      courtId,
      customerName,
      customerPhone,
      bookingDate,
      startTime,
      endTime,
      durationMinutes: duration,
      totalPrice,
      status: 'pending',
      notes: notes || null,
      createdAt: new Date(),
    }).returning();

    // Fetch payment instructions for this tenant
    const instructions = await db
      .select()
      .from(paymentInstructions)
      .where(and(eq(paymentInstructions.tenantId, courtData.tenantId), eq(paymentInstructions.isActive, true)));

    return NextResponse.json({
      booking: newBooking[0],
      paymentInstructions: instructions,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create public booking', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
