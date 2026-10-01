// Snap-to-list: read a photo of a stall or its menu board and turn it into a listing.
// Server-only: imported by the /api/snap route handler, never by client components.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

export const SnapResult = z.object({
  isFoodStall: z.boolean().describe("False if the photo shows no food stall, cart, eatery or menu"),
  name: z.string().nullable().describe("Stall name exactly as painted or printed, in English letters; null if not visible"),
  cuisineTags: z.array(z.string()).describe("1-3 short tags, e.g. Dosa, Chaat, Momos, Breakfast"),
  veg: z.boolean().nullable().describe("True if clearly pure veg, false if non-veg items are visible, else null"),
  dishes: z.array(
    z.object({
      name: z.string().describe("Dish name in English"),
      original: z.string().nullable().describe("Name as written, if it was in Kannada, Hindi or another script"),
      price: z.number().nullable().describe("Price in rupees, null if not shown"),
    }),
  ),
  languages: z.array(z.string()).describe("Languages/scripts seen on the board"),
  note: z.string().describe("One short sentence for the user about what was read or what was unclear"),
});

export type SnapResult = z.infer<typeof SnapResult>;

export type SnapImage = { data: string; mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" };

const SYSTEM = `You help food lovers in Bengaluru list street food stalls on Hissa.
You'll get a photo of a stall, cart or handwritten menu board. Read what is actually there and fill in the listing.
Menus are often in Kannada, Hindi or Tamil, or mixed with English: translate dish names to the names Bengaluru customers use (e.g. "ಮಸಾಲೆ ದೋಸೆ" -> "Masale Dosa") and keep the original script.
Never invent dishes, prices or names that you cannot see. Leave a field null rather than guess.`;

export function hasClaudeCredentials() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export class SnapRefusedError extends Error {}

export async function readStallPhoto(image: SnapImage, hint?: { name?: string; area?: string }) {
  const client = new Anthropic();
  const context = hint?.name
    ? `The user says this is "${hint.name}"${hint.area ? ` in ${hint.area}` : ""}. Use that name unless the photo clearly shows a different one.`
    : "The user is suggesting a new stall.";

  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    // Server-side refusal fallback: if a safety classifier declines, the API reroutes to a suitable model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "medium",
      format: betaZodOutputFormat(SnapResult),
    },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } },
          { type: "text", text: `${context} Fill in the listing from this photo.` },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") throw new SnapRefusedError("Claude declined to read this photo");
  if (!response.parsed_output) throw new Error(`No listing returned (stop_reason: ${response.stop_reason})`);
  return response.parsed_output;
}
