'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Calendar, Clock, User, Mail, Phone, Home } from 'lucide-react'
import Link from 'next/link'

export default function BookingConfirmationPage() {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Success Animation */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="confetti-animation">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`confetti-piece bg-${['pink', 'purple', 'blue', 'green', 'yellow'][i % 5]}-400`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for choosing ConnieNail Salon
          </p>
        </div>

        {/* Confirmation Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Your Appointment Details
            </CardTitle>
            <CardDescription>
              We've sent a confirmation email with all the details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-gray-600">
                      Your selected appointment date
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-gray-600">
                      Your selected time slot
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Technician</p>
                    <p className="text-gray-600">
                      Our expert team will take care of you
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Services Booked</h3>
                  <div className="text-gray-600">
                    Your selected services and treatments
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <p className="text-gray-600 text-sm">
                    We'll send updates to your provided email and phone number
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Appointment Preparation</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Please arrive 10 minutes early for your appointment</li>
                  <li>• Remove any existing nail polish before your visit</li>
                  <li>• Bring comfortable clothes and flip-flops if getting a pedicure</li>
                </ul>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">Cancellation Policy</h4>
                <p className="text-sm text-amber-700">
                  Please notify us at least 24 hours in advance if you need to reschedule or cancel your appointment.
                  Call us at (202) 898-0826 or visit our contact page.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Location</h4>
                <p className="text-sm text-green-700">
                  📍 The Ronald Reagan Building, Space C-044<br/>
                  1300 Pennsylvania Avenue NW, Washington, DC 20004<br/>
                  📞 (202) 898-0826
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Phone className="h-5 w-5 mr-2" />
                Contact Us
              </Button>
            </Link>
            
            <Link href="/services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Book Another Service
              </Button>
            </Link>
          </div>
          
          <p className="text-gray-600 text-sm">
            Questions? Call us at (202) 898-0826 or visit our location in Washington, DC
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .confetti-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}