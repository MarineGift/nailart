'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function AdminManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Settings</CardTitle>
        <CardDescription>System settings and administrator permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Admin settings feature coming soon.</p>
        </div>
      </CardContent>
    </Card>
  )
}