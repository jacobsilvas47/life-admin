"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import SearchBar from "@/components/ui/search-bar";
import { Card, CardContent } from "@/components/ui/card";

type PersonalRecord = {
  id: string;
  title: string;
  record_type: string;
  expiration_date: string | null;
};

export default function PersonalRecordsList({
  records,
}: {
  records: PersonalRecord[];
}) {
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return records;
    }

    return records.filter((record) =>
      [
        record.title,
        record.record_type,
        record.expiration_date,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(query)
        )
    );
  }, [records, search]);

  return (
    <>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search personal records..."
      />

      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <h2 className="text-xl font-semibold">
              No matching records
            </h2>

            <p className="mt-2 text-muted-foreground">
              Try a different search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map((record) => (
            <Link
              key={record.id}
              href={`/personal-records/${record.id}`}
            >
              <Card className="cursor-pointer transition hover:border-primary">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold">
                    {record.title}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {record.record_type.replaceAll("_", " ")}
                  </p>

                  {record.expiration_date && (
                    <p className="mt-2 text-sm">
                      Expires: {record.expiration_date}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}