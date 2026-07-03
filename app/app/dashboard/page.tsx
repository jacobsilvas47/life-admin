import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const attentionItems = [
  {
    title: "Car registration",
    detail: "Due in 5 days",
    category: "Vehicle",
    priority: "Urgent",
  },
  {
    title: "Refrigerator water filter",
    detail: "Replace this week",
    category: "Home",
    priority: "Soon",
  },
  {
    title: "Passport renewal",
    detail: "Expires in 7 months",
    category: "Travel",
    priority: "Upcoming",
  },
];

const recentItems = [
  "Costco appliance receipt",
  "Home insurance policy",
  "Toyota registration",
  "Water heater warranty",
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Good morning, Jacob</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Here&apos;s what needs your attention.
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">24</p>
            <p className="text-sm text-muted-foreground">stored securely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">tracked items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">6</p>
            <p className="text-sm text-muted-foreground">upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm text-muted-foreground">next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {attentionItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.category}</Badge>
                  <Badge>{item.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Added</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentItems.map((item) => (
              <div key={item} className="rounded-lg border p-3 text-sm">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}