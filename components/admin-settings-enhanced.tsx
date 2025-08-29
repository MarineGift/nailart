'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HolidayManagement } from '@/components/holiday-management'
import { AdminDiscountSettings } from '@/components/admin-discount-settings'
import { ServicesManagement } from '@/components/services-management'
import { CarouselManagement } from '@/components/carousel-management'
import { GalleryManagement } from '@/components/gallery-management'
import { LogHistory } from '@/components/log-history'
import { Settings, Package, Percent, Image, RotateCcw, Clock, CalendarX } from 'lucide-react'

interface AdminSettingsEnhancedProps {
  currentUser?: any
}

export function AdminSettingsEnhanced({ currentUser }: AdminSettingsEnhancedProps = {}) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            Manage discount settings, services, carousel content, gallery, and history logs
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="discount" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="discount" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Percent className="h-4 w-4" />
            Discount Settings
          </TabsTrigger>
          <TabsTrigger 
            value="services" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Package className="h-4 w-4" />
            Services Management
          </TabsTrigger>
          <TabsTrigger 
            value="carousel" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4" />
            Carousel Management
          </TabsTrigger>
          <TabsTrigger 
            value="gallery" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Image className="h-4 w-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Clock className="h-4 w-4" />
            Log History
          </TabsTrigger>
          <TabsTrigger 
            value="holidays" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <CalendarX className="h-4 w-4" />
Holiday Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discount">
          <AdminDiscountSettings />
        </TabsContent>
        
        <TabsContent value="services">
          <ServicesManagement />
        </TabsContent>
        
        <TabsContent value="carousel">
          <CarouselManagement currentUser={currentUser} />
        </TabsContent>
        
        <TabsContent value="gallery">
          <GalleryManagement currentUser={currentUser} />
        </TabsContent>
        
        <TabsContent value="history">
          <LogHistory />
        </TabsContent>

        <TabsContent value="holidays">
          <HolidayManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}