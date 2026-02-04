import { useAuthStore } from "@/store/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-gray-600 text-sm">Manage your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Full Name</div>
            <div className="font-medium">{user?.fullName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium">{user?.email}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Role</div>
            <div className="font-medium">{user?.role}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Default Hourly Rate</div>
            <div className="font-medium">{user?.defaultHourlyRate}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">Password management coming soon</div>
        </CardContent>
      </Card>
    </div>
  )
}
