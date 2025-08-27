"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Settings, LogOut, Users, ClipboardList } from "lucide-react";

interface StaffData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  position: string;
}

export default function ManagerDashboard() {
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userType = localStorage.getItem("userType");
    const userData = localStorage.getItem("userData");

    if (!token || userType !== "staff" || !userData) {
      router.push("/staff-login");
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      if (parsedData.role !== "manager" && parsedData.role !== "admin") {
        router.push("/staff-dashboard");
        return;
      }
      setStaffData(parsedData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/staff-login");
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("userData");
    router.push("/staff-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!staffData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Manager Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {staffData.firstName} • {staffData.position}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800">
              <User className="w-4 h-4 mr-1" />
              Manager
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Manager-specific content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Booking Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Booking Management
              </CardTitle>
              <CardDescription>
                Assign bookings to staff members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => router.push("/admin")}
              >
                Manage Bookings
              </Button>
            </CardContent>
          </Card>

          {/* Staff Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Staff Assignment
              </CardTitle>
              <CardDescription>
                Assign customers to available staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => router.push("/assignment")}
              >
                Assignment Interface
              </Button>
            </CardContent>
          </Card>

          {/* My Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                My Schedule
              </CardTitle>
              <CardDescription>
                View your work schedule and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => router.push("/staff-schedule")}
              >
                View Schedule
              </Button>
            </CardContent>
          </Card>

          {/* My Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                My Bookings
              </CardTitle>
              <CardDescription>
                See customers assigned to you today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => router.push("/my-bookings")}
              >
                View My Bookings
              </Button>
            </CardContent>
          </Card>

          {/* Team Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Overview
              </CardTitle>
              <CardDescription>
                Monitor team performance and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => router.push("/team-overview")}
              >
                View Team
              </Button>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push("/staff-profile")}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Manager Info */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Manager Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="ml-2">{staffData.firstName} {staffData.lastName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Username:</span>
                  <span className="ml-2">{staffData.username}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Position:</span>
                  <span className="ml-2">{staffData.position}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="ml-2">{staffData.email || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            onClick={() => router.push("/")}
            className="text-sm"
          >
            ← Back to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}