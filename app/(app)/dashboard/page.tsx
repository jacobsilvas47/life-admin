import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabaseServer } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const [
    documentsResult,
    assetsResult,
    remindersResult,
  ] = await Promise.all([
    supabaseServer
      .from("documents")
      .select("*", { count: "exact", head: true }),

    supabaseServer
      .from("assets")
      .select("*", { count: "exact", head: true }),

    supabaseServer
      .from("reminders")
      .select("*", { count: "exact", head: true }),
  ]);

  const { data: upcomingReminders } =
    await supabaseServer
      .from("reminders")
      .select("*")
      .order("due_date")
      .limit(5);

  const { data: activities, error: activitiesError } =
    await supabaseServer
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

  const { data: pendingDocuments } =
    await supabaseServer
      .from("documents")
      .select("id, original_filename, status")
      .eq("status", "complete")
      .order("uploaded_at", { ascending: false })
      .limit(5);

  if (activitiesError) {
    console.error(activitiesError);
  }

  const documentCount = documentsResult.count ?? 0;
  const assetCount = assetsResult.count ?? 0;
  const reminderCount = remindersResult.count ?? 0;

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
            <p className="text-3xl font-bold">{documentCount}</p>
            <p className="text-sm text-muted-foreground">stored securely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assetCount}</p>
            <p className="text-sm text-muted-foreground">tracked items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{reminderCount}</p>
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
            {upcomingReminders && upcomingReminders.length > 0 ? (
              upcomingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h3 className="font-medium">
                      {reminder.title}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {reminder.due_date}
                    </p>
                  </div>

                  <Badge>Reminder</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing needs your attention 🎉
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Added</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-lg border p-3"
                >
                  <p className="font-medium">
                    {activity.title}
                  </p>

                  <p className="text-xs text-muted-foreground capitalize">
                    {activity.activity_type.replaceAll("_", " ")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Review Queue</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {pendingDocuments && pendingDocuments.length > 0 ? (
              pendingDocuments.map((document) => (
                <div
                  key={document.id}
                  className="rounded-lg border p-3"
                >
                  <p className="font-medium">
                    {document.original_filename}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Ready for review
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No documents waiting for review.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}