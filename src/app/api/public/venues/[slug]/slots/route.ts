import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { venues, courts, courtAvailabilityRules, bookings } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const courtId = searchParams.get('courtId');
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (!courtId || !date) {
      return NextResponse.json({ error: 'courtId and date are required' }, { status: 400 });
    }

    // Verify venue exists
    const venue = await db.query.venues.findFirst({
      where: and(eq(venues.slug, slug), eq(venues.isActive, true)),
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Determine day of week for the given date
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday

    // Get availability rules for this court + day
    const rules = await db
      .select()
      .from(courtAvailabilityRules)
      .where(
        and(
          eq(courtAvailabilityRules.courtId, courtId),
          eq(courtAvailabilityRules.dayOfWeek, dayOfWeek),
          eq(courtAvailabilityRules.isActive, true)
        )
      );

    if (rules.length === 0) {
      return NextResponse.json({ slots: [], message: 'No availability rules for this day' });
    }

    const rule = rules[0];
    const slotDuration = rule.slotDurationMinutes;

    // Generate time slots based on the rule
    const slots: { id: string; time: string; startTime: string; endTime: string; available: boolean }[] = [];
    
    const [startHour, startMin] = rule.startTime.split(':').map(Number);
    const [endHour, endMin] = rule.endTime.split(':').map(Number);
    const startTotalMins = startHour * 60 + startMin;
    const endTotalMins = endHour * 60 + endMin;

    for (let mins = startTotalMins; mins + slotDuration <= endTotalMins; mins += slotDuration) {
      const slotStart = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      const slotEnd = `${String(Math.floor((mins + slotDuration) / 60)).padStart(2, '0')}:${String((mins + slotDuration) % 60).padStart(2, '0')}`;
      
      slots.push({
        id: `slot-${slotStart}`,
        time: `${slotStart} - ${slotEnd}`,
        startTime: slotStart,
        endTime: slotEnd,
        available: true, // will be updated below
      });
    }

    // Check existing bookings for this court+date
    const existingBookings = await db
      .select({ startTime: bookings.startTime, endTime: bookings.endTime })
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, courtId),
          eq(bookings.bookingDate, date),
          or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending'))
        )
      );

    // Mark slots as unavailable if they overlap with existing bookings
    for (const slot of slots) {
      const [slotStartH, slotStartM] = slot.startTime.split(':').map(Number);
      const [slotEndH, slotEndM] = slot.endTime.split(':').map(Number);
      const slotStartMins = slotStartH * 60 + slotStartM;
      const slotEndMins = slotEndH * 60 + slotEndM;

      for (const booking of existingBookings) {
        const [bStartH, bStartM] = booking.startTime.split(':').map(Number);
        const [bEndH, bEndM] = booking.endTime.split(':').map(Number);
        const bStartMins = bStartH * 60 + bStartM;
        const bEndMins = bEndH * 60 + bEndM;

        // Check overlap
        if (slotStartMins < bEndMins && slotEndMins > bStartMins) {
          slot.available = false;
          break;
        }
      }
    }

    // Get court price for calculating total
    const court = await db.query.courts.findFirst({
      where: eq(courts.id, courtId),
    });

    return NextResponse.json({
      slots,
      slotDurationMinutes: slotDuration,
      pricePerHour: court?.pricePerHour || 0,
    });
  } catch (error) {
    console.error('Failed to fetch slots', error);
    return NextResponse.json({ error: 'Failed to fetch available slots' }, { status: 500 });
  }
}
