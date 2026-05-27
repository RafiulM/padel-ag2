import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { courts, venues } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const tenantId = 'tnt_1';
    const venueId = request.nextUrl.searchParams.get('venueId');

    const conditions = [eq(venues.tenantId, tenantId)];
    if (venueId) conditions.push(eq(courts.venueId, venueId));

    const courtsData = await db
      .select({
        id: courts.id,
        name: courts.name,
        description: courts.description,
        pricePerHour: courts.pricePerHour,
        isActive: courts.isActive,
        venueId: courts.venueId,
        venueName: venues.name,
        createdAt: courts.createdAt,
      })
      .from(courts)
      .innerJoin(venues, eq(courts.venueId, venues.id))
      .where(and(...conditions));

    const formatted = courtsData.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      venue: c.venueName,
      venueId: c.venueId,
      price: c.pricePerHour,
      type: c.description || 'Standard',
      status: c.isActive ? 'active' : 'maintenance',
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch courts', error);
    return NextResponse.json({ error: 'Failed to fetch courts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newCourt = await db.insert(courts).values({
      id: `C-${Date.now()}`,
      venueId: body.venueId,
      name: body.name,
      description: body.description,
      pricePerHour: body.pricePerHour,
      isActive: body.isActive !== false,
      createdAt: new Date(),
    }).returning();

    return NextResponse.json(newCourt[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create court', error);
    return NextResponse.json({ error: 'Failed to create court' }, { status: 500 });
  }
}
