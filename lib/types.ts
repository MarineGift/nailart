// ConnieNail Admin System Types
export interface AdminUser {
  id: string
  email: string
  password_hash?: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: 'super_admin' | 'admin' | 'editor' | 'viewer'
  permissions: string[]
  isActive: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  phone: string
  firstName: string | null
  lastName: string | null
  email: string | null
  dateOfBirth: string | null
  address: string | null
  notes: string | null
  preferredTechnician: string | null
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  duration: number // in minutes
  price: number
  category: string | null
  isActive: boolean
  createdAt: string
}

export interface Booking {
  id: string
  customerId: string
  serviceId: string
  technicianName: string | null
  appointmentDate: string
  appointmentTime: string
  duration: number | null
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  price: number | null
  notes: string | null
  source?: string | null // Added source field
  createdByAdminId: string
  createdAt: string
  updatedByAdminId: string | null
  updatedAt: string
  // Joined data
  customer?: Customer
  service?: Service
}

export interface Treatment {
  id: string
  bookingId: string | null
  customerId: string
  serviceName: string
  treatmentDate: string
  technicianName: string | null
  notes: string | null
  photos: string[]
  price: number | null
  createdByAdminId: string
  createdAt: string
  // Joined data
  customer?: Customer
}

export interface GalleryItem {
  id: string
  title: string | null
  description: string | null
  imageUrl: string
  category: string | null
  tags: string[]
  isFeatured: boolean
  isPublished: boolean
  sortOrder: number
  createdByAdminId: string
  createdAt: string
  updatedAt: string
}

export interface NewsItem {
  id: string
  title: string
  slug: string | null
  summary: string | null
  content: string | null
  featuredImage: string | null
  authorName: string | null
  isPublished: boolean
  publishedAt: string | null
  createdByAdminId: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  imageUrl: string | null
  category: string | null
  brand: string | null
  isFeatured: boolean
  isAvailable: boolean
  stockQuantity: number
  createdByAdminId: string
  createdAt: string
  updatedAt: string
}

export interface CarouselImage {
  id: string
  title: string | null
  description: string | null
  imageUrl: string
  linkUrl: string | null
  buttonText: string | null
  sortOrder: number
  isActive: boolean
  createdByAdminId: string
  createdAt: string
  updatedAt: string
}

export interface CustomerCommunication {
  id: string
  customerId: string
  communicationType: 'email' | 'sms' | 'call' | 'note'
  subject: string | null
  content: string | null
  sentAt: string
  sentByAdminId: string
  status: 'sent' | 'delivered' | 'failed'
  // Joined data
  customer?: Customer
}

// Form types for creating/updating records
export interface AdminUserForm {
  email: string
  password?: string
  firstName: string
  lastName: string
  phone: string
  role: AdminUser['role']
  permissions: string[]
  isActive: boolean
}

export interface CustomerForm {
  phone: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  address: string
  notes: string
  preferredTechnician: string
}

export interface BookingForm {
  customerId: string
  serviceId: string
  technicianName: string
  appointmentDate: string
  appointmentTime: string
  notes: string
}

// Legacy types for compatibility
export interface CustomerInquiry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'pending' | 'responded' | 'resolved'
  createdAt: string
  updatedAt: string
}