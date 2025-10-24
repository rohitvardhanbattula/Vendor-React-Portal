import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Clock, CheckCircle } from "lucide-react";

// Mock data - will be replaced with CAPM backend data
const mockVendors = [
  {
    id: "V001",
    companyName: "Tech Solutions Inc.",
    contactName: "John Smith",
    email: "john@techsolutions.com",
    services: "IT Services",
    status: "approved",
    registrationDate: "2025-01-15",
  },
  {
    id: "V002",
    companyName: "Global Consulting Ltd.",
    contactName: "Sarah Johnson",
    email: "sarah@globalconsult.com",
    services: "Consulting",
    status: "pending",
    registrationDate: "2025-01-20",
  },
  {
    id: "V003",
    companyName: "Manufacturing Pro",
    contactName: "Michael Chen",
    email: "michael@mfgpro.com",
    services: "Manufacturing",
    status: "approved",
    registrationDate: "2025-01-18",
  },
];

const stats = [
  {
    title: "Total Vendors",
    value: "124",
    icon: Building2,
    description: "Active in system",
  },
  {
    title: "Approved",
    value: "98",
    icon: CheckCircle,
    description: "Verified vendors",
  },
  {
    title: "Pending Review",
    value: "26",
    icon: Clock,
    description: "Awaiting approval",
  },
  {
    title: "Active Users",
    value: "87",
    icon: Users,
    description: "Currently engaged",
  },
];

export const VendorDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Vendor Management</h2>
        <p className="text-muted-foreground">Overview of registered vendors and statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Vendors</CardTitle>
          <CardDescription>A list of all vendors in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor ID</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.id}</TableCell>
                  <TableCell>{vendor.companyName}</TableCell>
                  <TableCell>{vendor.contactName}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{vendor.services}</TableCell>
                  <TableCell>
                    <Badge
                      variant={vendor.status === "approved" ? "default" : "secondary"}
                      className={
                        vendor.status === "approved"
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }
                    >
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{vendor.registrationDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
