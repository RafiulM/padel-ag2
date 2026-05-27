import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(cast(strftime('%s', 'now') as integer))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(cast(strftime('%s', 'now') as integer))`),
});

export const sessions = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verifications = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  ownerUserId: text('owner_user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const venues = sqliteTable('venues', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  description: text('description'),
  phoneWhatsapp: text('phone_whatsapp').notNull(),
  openTime: text('open_time').notNull(),
  closeTime: text('close_time').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const courts = sqliteTable('courts', {
  id: text('id').primaryKey(),
  venueId: text('venue_id').references(() => venues.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  pricePerHour: integer('price_per_hour').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const courtAvailabilityRules = sqliteTable('court_availability_rules', {
  id: text('id').primaryKey(),
  courtId: text('court_id').references(() => courts.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 6 = Saturday
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  slotDurationMinutes: integer('slot_duration_minutes').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.id).notNull(),
  venueId: text('venue_id').references(() => venues.id).notNull(),
  courtId: text('court_id').references(() => courts.id).notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  bookingDate: text('booking_date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  totalPrice: integer('total_price').notNull(),
  status: text('status').notNull(), // pending, confirmed, cancelled, completed
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const paymentInstructions = sqliteTable('payment_instructions', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').references(() => tenants.id).notNull(),
  venueId: text('venue_id').references(() => venues.id),
  method: text('method').notNull(), // bank_transfer, qris
  accountName: text('account_name').notNull(),
  accountNumber: text('account_number').notNull(),
  bankName: text('bank_name'),
  qrisImageUrl: text('qris_image_url'),
  instructions: text('instructions'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const paymentConfirmations = sqliteTable('payment_confirmations', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').references(() => bookings.id).notNull(),
  proofImageUrl: text('proof_image_url'),
  confirmedByUserId: text('confirmed_by_user_id').references(() => users.id),
  confirmedAt: integer('confirmed_at', { mode: 'timestamp' }),
  status: text('status').notNull(), // submitted, approved, rejected
  notes: text('notes'),
});
