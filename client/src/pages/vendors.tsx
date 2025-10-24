import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, MapPin } from "lucide-react";

interface Vendor {
  id: string;
  vendorName: string;
  vendorType: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  notes: string | null;
}

export default function Vendors() {
  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const vendorsByType = vendors?.reduce((acc, vendor) => {
    if (!acc[vendor.vendorType]) {
      acc[vendor.vendorType] = [];
    }
    acc[vendor.vendorType].push(vendor);
    return acc;
  }, {} as Record<string, Vendor[]>);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Vendors & Contractors
          </h1>
          <p className="text-muted-foreground">
            Manage building service providers and contractors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {vendors?.length || 0} Total Vendors
          </span>
        </div>
      </div>

      {(!vendors || vendors.length === 0) ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Vendors</h3>
            <p className="text-muted-foreground">
              No vendors have been added to the system yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(vendorsByType || {}).map(([type, vendorList]) => (
            <div key={type}>
              <h2 className="text-xl font-semibold mb-4 capitalize">
                {type.replace(/_/g, " ")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendorList.map((vendor) => (
                  <Card key={vendor.id} data-testid={`card-vendor-${vendor.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{vendor.vendorName}</CardTitle>
                        <Badge variant={vendor.status === "active" ? "default" : "secondary"}>
                          {vendor.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {vendor.contactName && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{vendor.contactName}</span>
                        </div>
                      )}
                      {vendor.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                            {vendor.email}
                          </a>
                        </div>
                      )}
                      {vendor.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${vendor.phone}`} className="text-primary hover:underline">
                            {vendor.phone}
                          </a>
                        </div>
                      )}
                      {vendor.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">{vendor.address}</span>
                        </div>
                      )}
                      {vendor.notes && (
                        <p className="text-sm text-muted-foreground pt-2 border-t">
                          {vendor.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
