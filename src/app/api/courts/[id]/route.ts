import { NextResponse } from 'next/server';
import { db } from '@/db';
import { courts, venues } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = 'tnt_1';
    const { id } = await params;

    const court = await db
      .select({
        id: courts.id,
        name: courts.name,
        description: courts.description,
        pricePerHour: courts.pricePerHour,
        isActive: courts.isActive,
        venueId: courts.venueId,
        venueName: venues.name,
      })
      .from(courts)
      .innerJoin(venues, eq(courts.venueId, venues.id))
      .where(and(eq(courts.id, id), eq(venues.tenantId, tenantId)))
      .limit(1);

    if (court.length === 0) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    return NextResponse.json(court[0]);
  } catch (error) {
    console.error('Failed to fetch court', error);
    return NextResponse.json({ error: 'Failed to fetch court' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await db.update(courts).set({
      name: body.name,
      description: body.description,
      pricePerHour: body.pricePerHour,
      isActive: body.isActive,
    }).where(eq(courts.id, id)).returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Failed to update court', error);
    return NextResponse.json({ error: 'Failed to update court' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const deleted = await db.delete(courts).where(eq(courts.id, id)).returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete court', error);
    return NextResponse.json({ error: 'Failed to delete court' }, { status: 500 });
  }
}
