import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateCollegeInsights, sendWeeklyDigest, syncAllPlatforms } from "@/inngest/functions/sync";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncAllPlatforms, generateCollegeInsights, sendWeeklyDigest]
});
