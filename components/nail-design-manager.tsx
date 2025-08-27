'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function NailDesignManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nail Design Management</CardTitle>
        <CardDescription>Manage nail designs and patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Nail design management feature coming soon.</p>
        </div>
      </CardContent>
    </Card>
  )
}