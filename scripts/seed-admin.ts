import { db } from "@/db";
import { users, tenants, venues, courts, courtAvailabilityRules } from "@/db/schema";
import { auth } from "@/lib/auth";

async function seed() {
    const email = "admin@example.com";
    const password = "password123";
    const name = "Admin User";
    
    console.log("Creating admin user via better-auth...");
    
    let userId;

    try {
        const response = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            }
        });
        userId = response.user.id;
        console.log("Admin user created successfully:", response.user.email);
    } catch (e: any) {
        if (e.message?.includes("already exists") || e.message?.includes("UNIQUE constraint failed")) {
            console.log("Admin user already exists. Fetching...");
            // We can fetch from db if it exists
            const existingUser = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.email, email)
            });
            if (existingUser) {
                userId = existingUser.id;
            } else {
                console.error("User exists but could not be fetched");
                return;
            }
        } else {
            console.error("Failed to create admin:", e.message || e);
            return;
        }
    }

    if (!userId) {
        console.error("No user ID found, aborting seed.");
        return;
    }

    console.log("Creating dummy data for user:", userId);

    const now = new Date();

    // 1. Create Tenant
    const tenantId = `tenant-${Date.now()}`;
    await db.insert(tenants).values({
        id: tenantId,
        ownerUserId: userId,
        name: "Gelora Padel",
        slug: "gelora-padel",
        createdAt: now,
    });
    console.log("Tenant created:", tenantId);

    // 2. Create Venue
    const venueId = `venue-${Date.now()}`;
    await db.insert(venues).values({
        id: venueId,
        tenantId,
        name: "Gelora Padel Senayan",
        slug: "gelora-padel-senayan",
        address: "Jl. Pintu Satu Senayan",
        city: "Jakarta Pusat",
        description: "Premium padel courts in the heart of Jakarta.",
        phoneWhatsapp: "6281234567890",
        openTime: "06:00",
        closeTime: "23:00",
        isActive: true,
        createdAt: now,
    });
    console.log("Venue created:", venueId);

    // 3. Create Courts
    const court1Id = `court-1-${Date.now()}`;
    const court2Id = `court-2-${Date.now()}`;
    
    await db.insert(courts).values([
        {
            id: court1Id,
            venueId,
            name: "Court 1 - Indoor",
            description: "Standard indoor court with premium turf.",
            pricePerHour: 250000,
            isActive: true,
            createdAt: now,
        },
        {
            id: court2Id,
            venueId,
            name: "Court 2 - Semi Indoor",
            description: "Semi indoor court with great ventilation.",
            pricePerHour: 200000,
            isActive: true,
            createdAt: now,
        }
    ]);
    console.log("Courts created:", court1Id, court2Id);

    // 4. Create Availability Rules (Every day, 06:00 to 23:00)
    const availabilityRules = [];
    for (const courtId of [court1Id, court2Id]) {
        for (let day = 0; day <= 6; day++) {
            availabilityRules.push({
                id: `rule-${courtId}-${day}`,
                courtId: courtId,
                dayOfWeek: day,
                startTime: "06:00",
                endTime: "23:00",
                slotDurationMinutes: 60,
                isActive: true,
            });
        }
    }
    await db.insert(courtAvailabilityRules).values(availabilityRules);
    console.log("Availability rules created.");
    console.log("Seed completed successfully!");
}

seed().catch(console.error);
