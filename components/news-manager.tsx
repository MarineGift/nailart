'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function NewsManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>News Management</CardTitle>
        <CardDescription>Manage salon news and announcements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>News management feature coming soon.</p>
        </div>
      </CardContent>
    </Card>
  )
}