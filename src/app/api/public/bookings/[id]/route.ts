import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, courts, venues, paymentInstructions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Fetch the booking with court and venue info
    const result = await db
      .select({
        id: bookings.id,
        customerName: bookings.customerName,
        customerPhone: bookings.customerPhone,
        bookingDate: bookings.bookingDate,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        durationMinutes: bookings.durationMinutes,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        notes: bookings.notes,
        courtName: courts.name,
        venueName: venues.name,
        venuePhone: venues.phoneWhatsapp,
        tenantId: bookings.tenantId,
      })
      .from(bookings)
      .innerJoin(courts, eq(bookings.courtId, courts.id))
      .innerJoin(venues, eq(bookings.venueId, venues.id))
      .where(eq(bookings.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = result[0];

    // Fetch payment instructions for this tenant
    const instructions = await db
      .select()
      .from(paymentInstructions)
      .where(and(eq(paymentInstructions.tenantId, booking.tenantId), eq(paymentInstructions.isActive, true)));

    // Find the bank transfer and QRIS instructions
    const bankTransfer = instructions.find((i) => i.method === 'bank_transfer');
    const qris = instructions.find((i) => i.method === 'qris');

    return NextResponse.json({
      booking: {
        id: booking.id,
        venueName: booking.venueName,
        courtName: booking.courtName,
        date: new Date(booking.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: `${booking.startTime} - ${booking.endTime}`,
        totalPrice: booking.totalPrice,
        status: booking.status,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
      },
      payment: {
        bankName: bankTransfer?.bankName || null,
        accountNumber: bankTransfer?.accountNumber || null,
        accountName: bankTransfer?.accountName || null,
        qrisImageUrl: qris?.qrisImageUrl || null,
        whatsappNumber: booking.venuePhone?.replace(/[^0-9]/g, '') || '',
        instructions: bankTransfer?.instructions || 'Please transfer the exact amount.',
      },
    });
  } catch (error) {
    console.error('Failed to fetch booking status', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
