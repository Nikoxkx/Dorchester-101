import { pgTable, serial, varchar, text, integer, boolean, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';

// Housing Projects - BPDA approved developments
export const housingProjects = pgTable('housing_projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  developer: varchar('developer', { length: 255 }),
  architect: varchar('architect', { length: 255 }),
  address: varchar('address', { length: 500 }).notNull(),
  neighborhood: varchar('neighborhood', { length: 100 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  totalUnits: integer('total_units'),
  incomeRestrictedUnits: integer('income_restricted_units'),
  marketRateUnits: integer('market_rate_units'),
  amiBreakdown: jsonb('ami_breakdown'), // { "30": 10, "50": 20, "60": 15, "80": 25 }
  commercialSqFt: integer('commercial_sq_ft'),
  parkingSpaces: integer('parking_spaces'),
  description: text('description'),
  sustainabilityFeatures: text('sustainability_features'),
  communityBenefits: text('community_benefits'),
  status: varchar('status', { length: 50 }), // planning, approved, under_construction, complete
  approvalDate: timestamp('approval_date'),
  expectedCompletion: timestamp('expected_completion'),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }),
  fundingSources: text('funding_sources'),
  bpdaLink: varchar('bpda_link', { length: 500 }),
  imageUrl: varchar('image_url', { length: 500 }),
  applicationInfo: text('application_info'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Affordable Housing Listings
export const affordableHousingListings = pgTable('affordable_housing_listings', {
  id: serial('id').primaryKey(),
  propertyName: varchar('property_name', { length: 255 }).notNull(),
  address: varchar('address', { length: 500 }).notNull(),
  neighborhood: varchar('neighborhood', { length: 100 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  unitTypes: jsonb('unit_types'), // [{ type: "2BR", count: 5, rent: 1200 }]
  amiRequired: integer('ami_required'), // percentage
  incomeMinimum: integer('income_minimum'),
  incomeMaximum: integer('income_maximum'),
  eligibilityRequirements: text('eligibility_requirements'),
  waitlistStatus: varchar('waitlist_status', { length: 50 }), // open, closed, lottery_pending
  applicationDeadline: timestamp('application_deadline'),
  lotteryDate: timestamp('lottery_date'),
  howToApply: text('how_to_apply'),
  propertyManagerName: varchar('property_manager_name', { length: 255 }),
  propertyManagerPhone: varchar('property_manager_phone', { length: 50 }),
  propertyManagerEmail: varchar('property_manager_email', { length: 255 }),
  amenities: text('amenities'),
  petPolicy: text('pet_policy'),
  transitAccess: text('transit_access'),
  sourceUrl: varchar('source_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Food Resources
export const foodResources = pgTable('food_resources', {
  id: serial('id').primaryKey(),
  organizationName: varchar('organization_name', { length: 255 }).notNull(),
  address: varchar('address', { length: 500 }).notNull(),
  neighborhood: varchar('neighborhood', { length: 100 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  phone: varchar('phone', { length: 50 }),
  website: varchar('website', { length: 500 }),
  hours: jsonb('hours'), // { "monday": "9am-5pm", ... }
  languages: text('languages'),
  foodTypes: text('food_types'), // produce, canned, hot meals, etc.
  requirements: text('requirements'),
  specialPrograms: text('special_programs'),
  acceptsEbt: boolean('accepts_ebt'),
  deliveryAvailable: boolean('delivery_available'),
  resourceType: varchar('resource_type', { length: 50 }), // pantry, hot_meals, drop_off
  lastVerified: timestamp('last_verified'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Community Organizations
export const communityOrganizations = pgTable('community_organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  programName: varchar('program_name', { length: 255 }),
  category: varchar('category', { length: 100 }), // housing, legal, food, healthcare, etc.
  address: varchar('address', { length: 500 }),
  neighborhood: varchar('neighborhood', { length: 100 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  phone: varchar('phone', { length: 50 }),
  tty: varchar('tty', { length: 50 }),
  fax: varchar('fax', { length: 50 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 500 }),
  hours: jsonb('hours'),
  languages: text('languages'),
  eligibility: text('eligibility'),
  services: text('services'),
  howToAccess: text('how_to_access'),
  documentsNeeded: text('documents_needed'),
  isFree: boolean('is_free'),
  applicationUrl: varchar('application_url', { length: 500 }),
  notes: text('notes'),
  lastVerified: timestamp('last_verified'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Market Data
export const marketData = pgTable('market_data', {
  id: serial('id').primaryKey(),
  dataType: varchar('data_type', { length: 50 }).notNull(), // median_rent, median_sale, inventory
  unitType: varchar('unit_type', { length: 20 }), // studio, 1br, 2br, 3br, etc.
  zipCode: varchar('zip_code', { length: 10 }),
  value: decimal('value', { precision: 12, scale: 2 }),
  period: varchar('period', { length: 20 }), // 2024-01, 2024-Q1, etc.
  source: varchar('source', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// News Articles
export const newsArticles = pgTable('news_articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  summary: text('summary'),
  content: text('content'),
  source: varchar('source', { length: 255 }),
  sourceUrl: varchar('source_url', { length: 500 }),
  imageUrl: varchar('image_url', { length: 500 }),
  category: varchar('category', { length: 50 }), // housing, food, community, policy
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// User Settings (stored locally, no PII)
export const appSettings = pgTable('app_settings', {
  id: serial('id').primaryKey(),
  settingKey: varchar('setting_key', { length: 100 }).notNull().unique(),
  settingValue: text('setting_value'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Types for TypeScript
export type HousingProject = typeof housingProjects.$inferSelect;
export type NewHousingProject = typeof housingProjects.$inferInsert;

export type AffordableHousingListing = typeof affordableHousingListings.$inferSelect;
export type NewAffordableHousingListing = typeof affordableHousingListings.$inferInsert;

export type FoodResource = typeof foodResources.$inferSelect;
export type NewFoodResource = typeof foodResources.$inferInsert;

export type CommunityOrganization = typeof communityOrganizations.$inferSelect;
export type NewCommunityOrganization = typeof communityOrganizations.$inferInsert;

export type MarketDataPoint = typeof marketData.$inferSelect;
export type NewMarketDataPoint = typeof marketData.$inferInsert;

export type NewsArticle = typeof newsArticles.$inferSelect;
export type NewNewsArticle = typeof newsArticles.$inferInsert;
