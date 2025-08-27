'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Phone, Mail, DollarSign, FileText, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface BookingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: {
    id: string
    customerId: number
    serviceId: number
    staffId: string
    bookingDate: string
    timeSlot: string
    status: string
    price: number
    duration: number
    notes?: string
    customerName?: string
    serviceName?: string
    staffName?: string
  } | null
}

export default function BookingDetailsModal({ isOpen, onClose, booking }: BookingDetailsModalProps) {
  if (!booking) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800' 
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '확정'
      case 'pending': return 'pending'
      case 'completed': return 'completed'
      case 'cancelled': return 'cancelled'
      default: return status
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-booking-details">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-purple-600" />
            booking 상세 information
          </DialogTitle>
          <DialogDescription>
            booking ID: {booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(booking.status)} data-testid="badge-status">
              {getStatusText(booking.status)}
            </Badge>
            <div className="text-sm text-gray-500">
              {format(new Date(booking.bookingDate), 'yyyy년 MM월 dd일')}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              customer information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">이름</span>
                <p className="font-medium" data-testid="text-customer-name">{booking.customerName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">customer ID</span>
                <p className="font-medium">{booking.customerId}</p>
              </div>
            </div>
          </div>

          {/* Service and Staff Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-3">service information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-purple-600">service</span>
                  <p className="font-medium" data-testid="text-service-name">{booking.serviceName}</p>
                </div>
                <div>
                  <span className="text-sm text-purple-600">소요time</span>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {booking.duration}분
                  </p>
                </div>
                <div>
                  <span className="text-sm text-purple-600">가격</span>
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    ${booking.price ? booking.price.toLocaleString() : '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3">담당 staff</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-blue-600">staff명</span>
                  <p className="font-medium" data-testid="text-staff-name">{booking.staffName}</p>
                </div>
                <div>
                  <span className="text-sm text-blue-600">bookingtime</span>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {booking.timeSlot}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Source */}
          {booking.source && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                예약 경로
              </h3>
              <p className="text-blue-700" data-testid="text-source">{booking.source}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                data-testid="button-edit-booking"
              >
                <Edit className="h-4 w-4" />
                edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
                data-testid="button-cancel-booking"
              >
                <Trash2 className="h-4 w-4" />
                cancelled
              </Button>
            </div>
            <Button onClick={onClose} data-testid="button-close">
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}