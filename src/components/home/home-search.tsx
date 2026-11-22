"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/services?q=${encodeURIComponent(trimmed)}` : "/services");
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="mt-7 flex flex-col gap-2 rounded-2xl border bg-card p-2 shadow-lg shadow-primary/5 sm:flex-row"
    >
      <label htmlFor="home-service-search" className="sr-only">
        Search for a repair
      </label>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="home-service-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="What needs fixing? Try “washing machine”"
          className="h-11 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" size="lg" className="h-11 px-6">
        Find a technician
      </Button>
    </form>
  );
}
