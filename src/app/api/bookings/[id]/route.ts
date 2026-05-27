import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = 'tnt_1';
    const { id } = await params;

    const booking = await db.query.bookings.findFirst({
      where: and(eq(bookings.id, id), eq(bookings.tenantId, tenantId)),
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Failed to fetch booking', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = 'tnt_1';
    const { id } = await params;
    const body = await request.json();

    const updated = await db
      .update(bookings)
      .set({
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        notes: body.notes,
      })
      .where(and(eq(bookings.id, id), eq(bookings.tenantId, tenantId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Failed to update booking', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = 'tnt_1';
    const { id } = await params;

    const deleted = await db
      .delete(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.tenantId, tenantId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete booking', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
