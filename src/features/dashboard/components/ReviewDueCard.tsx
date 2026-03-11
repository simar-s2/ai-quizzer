"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { ReviewDueItem } from "@/features/dashboard/services/fetchReviewDue";

interface ReviewDueCardProps {
  reviews: ReviewDueItem[];
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 75) return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{Math.round(score)}%</Badge>;
  if (score >= 50) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{Math.round(score)}%</Badge>;
  return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">{Math.round(score)}%</Badge>;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, string> = {
    easy: "bg-blue-500/10 text-blue-600",
    medium: "bg-purple-500/10 text-purple-600",
    hard: "bg-orange-500/10 text-orange-600",
    expert: "bg-red-500/10 text-red-600",
  };
  return (
    <Badge className={`${map[difficulty] ?? ""} border-transparent capitalize`}>
      {difficulty}
    </Badge>
  );
}

export function ReviewDueCard({ reviews }: ReviewDueCardProps) {
  if (reviews.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Review Due
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
            <p className="font-medium mb-1">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No reviews due today. Come back tomorrow.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Review Due
          </CardTitle>
          <Badge variant="secondary" className="font-semibold">
            {reviews.length} today
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.slice(0, 5).map((review) => (
          <div
            key={review.quiz_id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate mb-1">{review.quiz_title}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {review.quiz_subject && (
                  <span className="text-xs text-muted-foreground">{review.quiz_subject}</span>
                )}
                <DifficultyBadge difficulty={review.quiz_difficulty} />
                <ScoreBadge score={review.last_score} />
              </div>
            </div>
            <Button asChild size="sm" variant="ghost" className="shrink-0">
              <Link href={`/quiz/${review.quiz_id}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
        {reviews.length > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-1">
            +{reviews.length - 5} more due
          </p>
        )}
      </CardContent>
    </Card>
  );
}