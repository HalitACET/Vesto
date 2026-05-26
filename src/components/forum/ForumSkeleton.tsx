"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ForumSkeleton() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-9 w-32" />
            </div>

            {[1, 2].map((i) => (
                <Card key={i} className="border border-border">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="aspect-square w-full max-w-[240px] mx-auto rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="border-t border-border pt-4 flex gap-4">
                            <Skeleton className="h-5 w-12" />
                            <Skeleton className="h-5 w-12" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
