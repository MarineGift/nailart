import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
  password: varchar("password", { length: 255 }), // Added for customer login (hashed)
  email: varchar("email", { length: 150 }),
  address: text("address"),
  totalVisits: integer("total_visits").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default('0'),
  vipLevel: varchar("vip_level", { length: 20 }).default('Bronze'),
  lastVisit: timestamp("last_visit"),
  preferredServices: text("preferred_services").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories table for services
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default('#8B5CF6'), // Purple default
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Services table
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).unique(), // Service code like SPA001, NT001
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  basePriceCents: integer("base_price_cents").notNull(), // Price in cents
  durationMin: integer("duration_min").notNull(), // Duration in minutes
  categoryId: varchar("category_id").references(() => categories.id),
  category: varchar("category", { length: 50 }), // Legacy support
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by"),
  updatedBy: varchar("updated_by"),
});

// Staff table
export const staff = pgTable("staff", {
  id: varchar("id").primaryKey(),
  staffNumber: varchar("staff_number", { length: 50 }),
  username: varchar("username", { length: 50 }).unique().notNull(), // Added for login
  password: varchar("password", { length: 255 }).notNull(), // Added for login (hashed)
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 150 }).unique(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  address: text("address"),
  hireDate: timestamp("hire_date"),
  resignationDate: timestamp("resignation_date"),
  status: varchar("status", { length: 20 }).default('active'),
  roleId: varchar("role_id"),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  salary: decimal("salary", { precision: 12, scale: 2 }),
  profileImageUrl: varchar("profile_image_url"),
  notes: text("notes"),
  role: varchar("role", { length: 20 }).default('staff'), // 'admin', 'manager', 'staff'
  workingStartTime: varchar("working_start_time", { length: 8 }),
  workingEndTime: varchar("working_end_time", { length: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Work Schedule table
export const staffWorkSchedule = pgTable("staff_work_schedule", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  workDate: varchar("work_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  startTime: varchar("start_time", { length: 5 }).notNull(), // HH:MM format
  endTime: varchar("end_time", { length: 5 }).notNull(), // HH:MM format
  isWorking: boolean("is_working").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table - Booking information 
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customer_id: varchar("customer_id").references(() => customers.id).notNull(),
  customer_phone: varchar("customer_phone"),
  booking_start: timestamp("booking_start").notNull(),
  booking_end: timestamp("booking_end").notNull(),
  staff_id: varchar("staff_id").references(() => staff.id), // Add staff assignment field
  notes: text("notes"),
  prepay: boolean("prepay").default(false),
  prepay_cents: integer("prepay_cents").default(0),
  status: varchar("status", { length: 20 }).default('scheduled'),
  created_at: timestamp("created_at").defaultNow(),
  created_by: varchar("created_by"),
  updated_at: timestamp("updated_at").defaultNow(),
  updated_by: varchar("updated_by"),
// End of bookings table definition
});

// Booking Details table - Services in each booking
export const bookingDetails = pgTable("booking_details", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  booking_id: varchar("booking_id").references(() => bookings.id).notNull(),
  service_id: integer("service_id").references(() => services.id).notNull(),
  quantity: integer("quantity").default(1),
  price_cents: integer("price_cents").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).default('pending'),
  transactionId: varchar("transaction_id", { length: 100 }),
  paymentDate: timestamp("payment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Treatment records (actual services performed) - Complete treatment information
export const treatments = pgTable("treatments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  
  // Treatment time information
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  actualDuration: integer("actual_duration"), // in minutes
  
  // Payment information
  prepaidAmount: decimal("prepaid_amount", { precision: 10, scale: 2 }).default('0'), // Pre-paid amount
  actualPrice: decimal("actual_price", { precision: 10, scale: 2 }), // Actual service price
  tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }).default('0'), // Tip amount
  tipPaymentMethod: varchar("tip_payment_method", { length: 20 }).default('cash'), // 'card' or 'cash'
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }), // Final payment amount (actual price + tip)
  
  // Service evaluation
  customerSatisfaction: integer("customer_satisfaction"), // 1-5 rating
  serviceNotes: text("service_notes"),
  
  // Next appointment booking
  nextAppointmentDate: timestamp("next_appointment_date"),
  nextAppointmentNotes: text("next_appointment_notes"),
  
  // Status management
  treatmentStatus: varchar("treatment_status", { length: 20 }).default('completed'), // 'completed', 'cancelled', 'no_show'
  paymentStatus: varchar("payment_status", { length: 20 }).default('pending'), // 'pending', 'partial', 'completed'
  
  serviceDate: timestamp("service_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Treatment Details table - Individual services in each treatment
export const treatmentDetails = pgTable("treatment_details", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  treatment_id: integer("treatment_id").references(() => treatments.id).notNull(),
  service_id: integer("service_id").references(() => services.id).notNull(),
  service_name: varchar("service_name", { length: 100 }).notNull(),
  duration_minutes: integer("duration_minutes").notNull(),
  price_cents: integer("price_cents").notNull(),
  staff_notes: text("staff_notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Gallery images table for carousel
export const galleryImages = pgTable("gallery_images", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  gradientColor: varchar("gradient_color", { length: 100 }), // Gradient CSS classes like "from-pink-400 to-rose-400"
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by"),
});

// Staff unavailable schedule table - 근무 불가 일정 관리
export const staffUnavailableSchedule = pgTable("staff_unavailable_schedule", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  staffId: varchar("staff_id").references(() => staff.id), // null means applies to all staff (salon holiday)
  startDate: varchar("start_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  endDate: varchar("end_date", { length: 10 }).notNull(), // YYYY-MM-DD format (same as start_date for single day)
  startTime: varchar("start_time", { length: 5 }).notNull(), // HH:MM format (00:00 for full day unavailable)
  endTime: varchar("end_time", { length: 5 }).notNull(), // HH:MM format (24:00 for full day unavailable)
  reason: varchar("reason", { length: 100 }), // "Holiday", "Vacation", "Personal", "Maintenance", etc.
  notes: text("notes"),
  createdBy: varchar("created_by").notNull(), // Staff/admin who created this restriction
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily work summary for staff
export const staffWorkSummary = pgTable("staff_work_summary", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  workDate: timestamp("work_date").notNull(),
  totalCustomers: integer("total_customers").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default('0'),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }).default('0'),
  servicesPerformed: jsonb("services_performed"), // array of service details
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking History table - Booking modification history tracking
export const bookingHistory = pgTable("booking_history", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  originalBookingDate: timestamp("original_booking_date"),
  originalTimeSlot: varchar("original_time_slot", { length: 10 }),
  newBookingDate: timestamp("new_booking_date"),
  newTimeSlot: varchar("new_time_slot", { length: 10 }),
  originalStaffId: varchar("original_staff_id").references(() => staff.id),
  newStaffId: varchar("new_staff_id").references(() => staff.id),
  changeReason: text("change_reason"),
  modifiedByStaffId: varchar("modified_by_staff_id").references(() => staff.id),
  modificationDate: timestamp("modification_date").defaultNow(),
  changeType: varchar("change_type", { length: 20 }), // 'reschedule', 'reassign', 'cancel', 'update'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff Schedules table (actual database table)
export const staffSchedules = pgTable("staff_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  workDate: varchar("work_date", { length: 10 }).notNull(), // YYYY-MM-DD format
  startTime: varchar("start_time", { length: 8 }).notNull(), // HH:MM:SS format
  endTime: varchar("end_time", { length: 8 }).notNull(), // HH:MM:SS format
  isAvailable: boolean("is_available").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Inquiries table
export const customerInquiries = pgTable("customer_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 150 }),
  inquiryType: varchar("inquiry_type", { length: 50 }).default('general'), // 'booking', 'service', 'complaint', 'general'
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).default('new'), // 'new', 'in_progress', 'resolved', 'closed'
  priority: varchar("priority", { length: 10 }).default('normal'), // 'low', 'normal', 'high', 'urgent'
  assignedStaffId: varchar("assigned_staff_id").references(() => staff.id),
  responseMessage: text("response_message"),
  respondedAt: timestamp("responded_at"),
  respondedBy: varchar("responded_by").references(() => staff.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;
export type StaffUnavailableSchedule = typeof staffUnavailableSchedule.$inferSelect;
export type InsertStaffUnavailableSchedule = typeof staffUnavailableSchedule.$inferInsert;
export type StaffSchedule = typeof staffSchedules.$inferSelect;
export type InsertStaffSchedule = typeof staffSchedules.$inferInsert;
export type BookingHistory = typeof bookingHistory.$inferSelect;
export type InsertBookingHistory = typeof bookingHistory.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Treatment = typeof treatments.$inferSelect;
export type InsertTreatment = typeof treatments.$inferInsert;
export type BookingDetail = typeof bookingDetails.$inferSelect;
export type InsertBookingDetail = typeof bookingDetails.$inferInsert;
export type TreatmentDetail = typeof treatmentDetails.$inferSelect;
export type InsertTreatmentDetail = typeof treatmentDetails.$inferInsert;
export type StaffWorkSummary = typeof staffWorkSummary.$inferSelect;
export type InsertStaffWorkSummary = typeof staffWorkSummary.$inferInsert;
export type CustomerInquiry = typeof customerInquiries.$inferSelect;
export type InsertCustomerInquiry = typeof customerInquiries.$inferInsert;

// Zod schemas for API validation
export const insertGalleryImageSchema = createInsertSchema(galleryImages);
export const insertStaffUnavailableScheduleSchema = createInsertSchema(staffUnavailableSchedule);
export const insertCustomerSchema = createInsertSchema(customers);
export const insertBookingSchema = createInsertSchema(bookings);
export const insertBookingHistorySchema = createInsertSchema(bookingHistory);
export const insertServiceSchema = createInsertSchema(services);
export const insertStaffSchema = createInsertSchema(staff);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertTreatmentSchema = createInsertSchema(treatments);
export const insertBookingDetailSchema = createInsertSchema(bookingDetails);
export const insertTreatmentDetailSchema = createInsertSchema(treatmentDetails);
export const insertCustomerInquirySchema = createInsertSchema(customerInquiries);

// Settings table for system configuration
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  category: varchar("category", { length: 50 }).default('general'),
  isEncrypted: boolean("is_encrypted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSetting = typeof insertSettingSchema._input;
export type SelectSetting = typeof settings.$inferSelect;