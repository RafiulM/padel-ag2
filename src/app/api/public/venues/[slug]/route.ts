import { NextResponse } from 'next/server';
import { db } from '@/db';
import { venues, courts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const venue = await db.query.venues.findFirst({
      where: and(eq(venues.slug, slug), eq(venues.isActive, true)),
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Fetch active courts for this venue
    const venueCourts = await db
      .select({
        id: courts.id,
        name: courts.name,
        description: courts.description,
        pricePerHour: courts.pricePerHour,
      })
      .from(courts)
      .where(and(eq(courts.venueId, venue.id), eq(courts.isActive, true)));

    return NextResponse.json({
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      address: venue.address,
      city: venue.city,
      description: venue.description,
      phone: venue.phoneWhatsapp,
      openTime: venue.openTime,
      closeTime: venue.closeTime,
      image: venue.imageUrl,
      courts: venueCourts.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        price: c.pricePerHour,
        type: c.description || 'Standard',
      })),
    });
  } catch (error) {
    console.error('Failed to fetch public venue', error);
    return NextResponse.json({ error: 'Failed to fetch venue' }, { status: 500 });
  }
}
