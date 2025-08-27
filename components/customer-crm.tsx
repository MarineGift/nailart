'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function CustomerCRM() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Management</CardTitle>
        <CardDescription>Manage customer information and relationships</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Customer management feature coming soon.</p>
        </div>
      </CardContent>
    </Card>
  )
}