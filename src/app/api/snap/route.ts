import Anthropic from "@anthropic-ai/sdk";
import { hasClaudeCredentials, readStallPhoto, SnapRefusedError, type SnapImage, type SnapResult } from "@/lib/ai/snap";

const MAX_BYTES = 5 * 1024 * 1024; // Claude's per-image limit
const MEDIA_TYPES = new Set<SnapImage["mediaType"]>(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// Shown when no API key is configured, so the flow still works in a demo.
const DEMO_RESULT: SnapResult = {
  isFoodStall: true,
  name: "Shree Annapoorna Gobi Stall",
  cuisineTags: ["Gobi Manchurian", "Evening"],
  veg: true,
  dishes: [
    { name: "Gobi Manchurian (dry)", original: "ಗೋಬಿ ಮಂಚೂರಿ", price: 60 },
    { name: "Gobi Rice", original: null, price: 70 },
    { name: "Mushroom Chilli", original: null, price: 80 },
  ],
  languages: ["Kannada", "English"],
  note: "Demo result: add ANTHROPIC_API_KEY to .env.local to read your real photo.",
};

export async function POST(request: Request) {
  const form = await request.formData();
  const photo = form.get("photo");
  const name = form.get("name");
  const area = form.get("area");

  if (!(photo instanceof File)) {
    return Response.json({ error: "Attach a photo." }, { status: 400 });
  }
  if (!MEDIA_TYPES.has(photo.type as SnapImage["mediaType"])) {
    return Response.json({ error: "Use a JPEG, PNG, WebP or GIF photo." }, { status: 415 });
  }
  if (photo.size > MAX_BYTES) {
    return Response.json({ error: "That photo is too large. Try one under 5 MB." }, { status: 413 });
  }

  if (!hasClaudeCredentials()) {
    return Response.json({ mode: "demo", result: DEMO_RESULT });
  }

  try {
    const image: SnapImage = {
      data: Buffer.from(await photo.arrayBuffer()).toString("base64"),
      mediaType: photo.type as SnapImage["mediaType"],
    };
    const result = await readStallPhoto(image, {
      name: typeof name === "string" ? name : undefined,
      area: typeof area === "string" ? area : undefined,
    });
    return Response.json({ mode: "live", result });
  } catch (err) {
    if (err instanceof SnapRefusedError) {
      return Response.json({ error: "We couldn't read this photo. Try a clearer shot of the stall or menu." }, { status: 422 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("[snap] Anthropic API key was rejected");
      return Response.json({ error: "The AI key isn't valid. Check ANTHROPIC_API_KEY." }, { status: 500 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Lots of people are snapping right now. Try again in a minute." }, { status: 429 });
    }
    if (err instanceof Anthropic.APIConnectionError) {
      return Response.json({ error: "Couldn't reach the AI service. Check your connection." }, { status: 503 });
    }
    console.error("[snap]", err);
    return Response.json({ error: "Something went wrong reading the photo." }, { status: 502 });
  }
}
