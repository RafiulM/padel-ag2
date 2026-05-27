import { NextResponse } from 'next/server';
import { db } from '@/db';
import { venues, courts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const tenantId = 'tnt_1';

    // Fetch all venues for the tenant, along with court counts
    const venuesData = await db
      .select({
        id: venues.id,
        name: venues.name,
        address: venues.address,
        phoneWhatsapp: venues.phoneWhatsapp,
        openTime: venues.openTime,
        closeTime: venues.closeTime,
        isActive: venues.isActive,
        imageUrl: venues.imageUrl,
        courtsCount: sql<number>`count(${courts.id})`,
      })
      .from(venues)
      .leftJoin(courts, eq(venues.id, courts.venueId))
      .where(eq(venues.tenantId, tenantId))
      .groupBy(venues.id);

    const formattedVenues = venuesData.map((v) => ({
      id: v.id,
      name: v.name,
      address: v.address,
      phone: v.phoneWhatsapp,
      openTime: v.openTime,
      closeTime: v.closeTime,
      courts: v.courtsCount,
      status: v.isActive ? 'active' : 'inactive',
      image: v.imageUrl,
    }));

    return NextResponse.json(formattedVenues);
  } catch (error) {
    console.error('Failed to fetch venues', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = 'tnt_1';
    const body = await request.json();
    
    // In a real app, you would validate 'body' with Zod here
    
    const newVenue = await db.insert(venues).values({
      id: `V-${Date.now()}`, // Simple ID generation for MVP
      tenantId,
      name: body.name,
      slug: body.name.toLowerCase().replace(/ /g, '-'),
      address: body.address,
      city: body.city || 'Unknown', // Need city in schema
      description: body.description,
      phoneWhatsapp: body.phone,
      openTime: body.openTime,
      closeTime: body.closeTime,
      isActive: body.status === 'active',
      imageUrl: body.image,
      createdAt: new Date(),
    }).returning();

    return NextResponse.json(newVenue[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create venue', error);
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
  }
}
