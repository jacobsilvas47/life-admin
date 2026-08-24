import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { getRelativeDate } from "@/lib/date/get-relative-date";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date/format-date";

function getActivityDate(dateString: string) {
  const activityDate = new Date(dateString);
  const today = new Date();

  const activityDay = new Date(
    activityDate.getFullYear(),
    activityDate.getMonth(),
    activityDate.getDate()
  );

  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diffDays = Math.round(
    (todayDay.getTime() - activityDay.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return activityDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

export default async function DashboardPage() {
    const authSupabase = await createAuthServerClient();

    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      return null;
    }

    const firstName =
      typeof user.user_metadata?.first_name === "string"
        ? user.user_metadata.first_name.trim()
        : "";

    const currentHour = new Date().getHours();

    const greeting =
      currentHour < 12
        ? "Good morning"
        : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  const now = new Date();

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(
    thirtyDaysFromNow.getDate() + 30
  );

    const [
    documentsResult,
    assetsResult,
    personalRecordsResult,
    remindersResult,
    expiringSoonResult,
  ] = await Promise.all([
    supabaseServer
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),

    supabaseServer
      .from("assets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),

    supabaseServer
      .from("personal_records")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),

    supabaseServer
      .from("reminders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),

    supabaseServer
      .from("reminders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("due_date", now.toISOString())
      .lte(
        "due_date",
        thirtyDaysFromNow.toISOString()
      ),
  ]);

    const { data: upcomingReminders } =
    await supabaseServer
      .from("reminders")
      .select(`
        *,
        personal_records (
          id,
          title
        )
      `)
      .eq("user_id", user.id)
      .order("due_date")
      .limit(5);

    const { data: activities, error: activitiesError } =
    await supabaseServer
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: pendingDocuments } =
    await supabaseServer
      .from("documents")
      .select("id, original_filename, status")
      .eq("user_id", user.id)
      .eq("status", "complete")
      .order("uploaded_at", { ascending: false })
      .limit(5);

  if (activitiesError) {
    console.error(activitiesError);
  }

  const documentCount = documentsResult.count ?? 0;

  const assetCount = assetsResult.count ?? 0;

  const personalRecordCount =
    personalRecordsResult.count ?? 0;

  const isNewUser =
    documentCount === 0 &&
    assetCount === 0 &&
    personalRecordCount === 0;

  const reminderCount = remindersResult.count ?? 0;

  const expiringSoonCount =
    expiringSoonResult.count ?? 0;

  const reminders =
  upcomingReminders?.map((reminder) => ({
    ...reminder,
    relative: getRelativeDate(formatDate(reminder.due_date)),
  })) ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            {isNewUser
              ? "Welcome to Life Admin."
              : "Here's what needs your attention."}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/upload">
              Upload Documents
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
          >
            <Link href="/assets">
              Assets
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
          >
            <Link href="/personal-records">
              Personal Records
            </Link>
          </Button>
        </div>
      </div>

      {isNewUser && (
        <Card className="mt-8">
          <CardContent className="p-8">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-muted-foreground">
                GET STARTED
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Upload your first document
              </h2>

              <p className="mt-3 text-muted-foreground">
                Add a receipt, warranty, manual, ID, or
                other important document. Life Admin will
                help organize the important information
                and keep everything connected.
              </p>

              <Button
                asChild
                className="mt-6"
              >
                <Link href="/upload">
                  Upload Your First Document
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-4 border-t pt-6 md:grid-cols-3">
              <div>
                <p className="font-medium">
                  1. Upload
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add an important document from your
                  life.
                </p>
              </div>

              <div>
                <p className="font-medium">
                  2. Review
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Life Admin extracts the important
                  details for you.
                </p>
              </div>

              <div>
                <p className="font-medium">
                  3. Stay organized
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Keep documents, assets, records, and
                  reminders connected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

     <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Link
        href="/documents"
        className="group"
      >
        <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Documents
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {documentCount}
            </p>

            <p className="text-sm text-muted-foreground">
              stored securely
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link
        href="/assets"
        className="group"
      >
        <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Assets
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {assetCount}
            </p>

            <p className="text-sm text-muted-foreground">
              tracked items
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link
        href="/personal-records"
        className="group"
      >
        <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Personal Records
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {personalRecordCount}
            </p>

            <p className="text-sm text-muted-foreground">
              important records
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link
        href="/reminders"
        className="group"
      >
        <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Reminders
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {reminderCount}
            </p>

            <p className="text-sm text-muted-foreground">
              upcoming
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link
        href="/reminders"
        className="group"
      >
        <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Expiring Soon
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {expiringSoonCount}
            </p>

            <p className="text-sm text-muted-foreground">
              next 30 days
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reminders.length > 0 ? (
              reminders.map((reminder) => (
              <Link
                key={reminder.id}
                href={`/personal-records/${reminder.personal_record_id}`}
                className="block"
              >
                <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <h3 className="font-medium">
                      {reminder.title}
                    </h3>

                   <p className="text-sm text-muted-foreground">
                      {reminder.relative.text}
                    </p>
                  </div>
                  <Badge
                    variant={
                      reminder.relative.priority === "high"
                        ? "destructive"
                        : reminder.relative.priority === "medium"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {reminder.relative.priority === "high"
                      ? "High"
                      : reminder.relative.priority === "medium"
                      ? "Soon"
                      : "Upcoming"}
                  </Badge>
                </div>
                </Link>
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
            <CardTitle>Recent Activity</CardTitle>
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

                  <p className="text-xs text-muted-foreground">
                    {getActivityDate(activity.created_at)}
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