import { NextResponse } from 'next/server';
import { db } from '@/db';
import { venues } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = 'tnt_1';
    const { id } = await params;

    const venue = await db.query.venues.findFirst({
      where: and(eq(venues.id, id), eq(venues.tenantId, tenantId)),
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: venue.id,
      name: venue.name,
      address: venue.address,
      phone: venue.phoneWhatsapp,
      openTime: venue.openTime,
      closeTime: venue.closeTime,
      status: venue.isActive ? 'active' : 'inactive',
      image: venue.imageUrl,
    });
  } catch (error) {
    console.error('Failed to fetch venue', error);
    return NextResponse.json({ error: 'Failed to fetch venue' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = 'tnt_1';
    const { id } = await params;
    const body = await request.json();
    
    const updatedVenue = await db.update(venues).set({
      name: body.name,
      address: body.address,
      phoneWhatsapp: body.phone,
      openTime: body.openTime,
      closeTime: body.closeTime,
      isActive: body.status === 'active',
      imageUrl: body.image,
    }).where(and(eq(venues.id, id), eq(venues.tenantId, tenantId))).returning();

    if (updatedVenue.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json(updatedVenue[0]);
  } catch (error) {
    console.error('Failed to update venue', error);
    return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = 'tnt_1';
    const { id } = await params;

    const deletedVenue = await db.delete(venues).where(and(eq(venues.id, id), eq(venues.tenantId, tenantId))).returning();

    if (deletedVenue.length === 0) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete venue', error);
    return NextResponse.json({ error: 'Failed to delete venue' }, { status: 500 });
  }
}
