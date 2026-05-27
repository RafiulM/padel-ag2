import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = 'tnt_1';
    const { id } = await params;
    const body = await request.json();

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await db
      .update(bookings)
      .set({ status: body.status })
      .where(and(eq(bookings.id, id), eq(bookings.tenantId, tenantId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Failed to update booking status', error);
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }
}
