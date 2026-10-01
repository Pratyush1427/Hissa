// Fictional stalls, vendors and critics for the prototype. Locations are real Bengaluru neighbourhoods.
import type { Backing, Campaign, Critic, Stall, VendorBacker, VendorRedemption, WalletTxn } from "./types";


export const stalls: Stall[] = [
  {
    id: "manju-benne-dosa",
    name: "Manju's Benne Dosa Cart",
    vendorName: "Manjunath",
    vendorAvatar: "👨🏽‍🍳",
    vendorQuote: "Butter is not optional. Neither is a smile.",
    area: "Basavanagudi",
    lat: 12.9422,
    lng: 77.5737,
    emoji: "🥞",
    hue: 30,
    dish: "masala-dosa",
    tags: ["Dosa", "Breakfast"],
    veg: true,
    avgPrice: 70,
    timings: "6:30 AM – 11:30 AM",
    ratings: { taste: 4.9, hygiene: 4.4, value: 4.9, vibe: 4.8 },
    ratingCount: 412,
    verified: true,
    since: 2014,
    dishes: [
      { name: "Benne Masala Dosa", price: 80 },
      { name: "Open Butter Dosa", price: 70 },
      { name: "Kesari Bath", price: 40 },
    ],
    aiSummary:
      "People love the crisp, butter-soaked dosa and the coconut chutney. The main complaint is a 20-minute queue on weekends. Hygiene has improved since the new steel counter.",
    reviews: [
      { userId: "ananya", rating: 5, text: "The benne dosa here ruined every other dosa for me. Go before 8 AM.", date: "2026-09-21" },
      { userId: "rahul", rating: 4, text: "Worth the queue. Chutney is unreal. Wish they had a second tawa.", date: "2026-09-14" },
    ],
    campaignId: "c-manju-second-tawa",
  },
  {
    id: "akka-thatte-idli",
    name: "Akka's Thatte Idli",
    vendorName: "Savitha",
    vendorAvatar: "👩🏽‍🍳",
    vendorQuote: "Everyone who eats here is family. Akka is what they call me.",
    area: "Malleshwaram",
    lat: 13.0035,
    lng: 77.571,
    emoji: "🍚",
    hue: 45,
    dish: "thatte-idli",
    tags: ["Idli", "Breakfast"],
    veg: true,
    avgPrice: 50,
    timings: "7:00 AM – 12:00 PM",
    ratings: { taste: 4.7, hygiene: 4.6, value: 4.9, vibe: 4.3 },
    ratingCount: 268,
    verified: true,
    since: 2018,
    dishes: [
      { name: "Thatte Idli (2)", price: 50 },
      { name: "Vada", price: 25 },
      { name: "Filter Coffee", price: 20 },
    ],
    aiSummary:
      "Soft, plate-sized idlis praised for consistency. Very clean setup. Some say it sells out by 11 AM.",
    reviews: [
      { userId: "meera", rating: 5, text: "Pillowy idli, spicy podi, and Akka remembers your order.", date: "2026-09-25" },
    ],
  },
  {
    id: "raju-chaat-corner",
    name: "Raju Chaat Corner",
    vendorName: "Raju",
    vendorAvatar: "👨🏾‍🍳",
    vendorQuote: "Thirty years on Food Street, and I still taste every batch.",
    area: "VV Puram",
    lat: 12.9496,
    lng: 77.5736,
    emoji: "🥗",
    hue: 140,
    dish: "masala-puri",
    tags: ["Chaat", "Evening"],
    veg: true,
    avgPrice: 60,
    timings: "4:30 PM – 10:30 PM",
    ratings: { taste: 4.8, hygiene: 3.6, value: 4.7, vibe: 4.9 },
    ratingCount: 530,
    verified: true,
    since: 2011,
    dishes: [
      { name: "Pani Puri", price: 40 },
      { name: "Masala Puri", price: 50 },
      { name: "Dahi Puri", price: 60 },
    ],
    aiSummary:
      "The masala puri is the star, often called the best on Food Street. Lively vibe. Hygiene ratings are mixed, mainly because there's no running water at the cart.",
    reviews: [
      { userId: "karthik", rating: 5, text: "Masala puri is a 10/10. Raju bhaiya's banter is free.", date: "2026-09-28" },
      { userId: "ananya", rating: 4, text: "Amazing taste. Would love to see a water tank and covered counter.", date: "2026-09-10" },
    ],
    campaignId: "c-raju-clean-cart",
  },
  {
    id: "shivajinagar-kebab-gaadi",
    name: "Bhai's Kebab Gaadi",
    vendorName: "Imran",
    vendorAvatar: "🧔🏽",
    vendorQuote: "My father's recipe, my late nights. Come hungry.",
    area: "Shivajinagar",
    lat: 12.9857,
    lng: 77.6057,
    emoji: "🍢",
    hue: 10,
    dish: "seekh-kebab",
    tags: ["Kebab", "Non-veg", "Late night"],
    veg: false,
    avgPrice: 150,
    timings: "6:00 PM – 1:00 AM",
    ratings: { taste: 4.8, hygiene: 4.0, value: 4.5, vibe: 4.7 },
    ratingCount: 377,
    verified: true,
    since: 2016,
    dishes: [
      { name: "Seekh Kebab", price: 160 },
      { name: "Chicken Tikka", price: 180 },
      { name: "Sulaimani Chai", price: 20 },
    ],
    aiSummary:
      "Smoky, well-marinated kebabs and a great late-night crowd. Prices are a little higher than neighbours, but people say the portions justify it.",
    reviews: [
      { userId: "rahul", rating: 5, text: "Best seekh in the area, and the green chutney slaps.", date: "2026-09-19" },
    ],
    campaignId: "c-bhai-tandoor",
  },
  {
    id: "kumar-filter-coffee",
    name: "Kumar Filter Coffee Stand",
    vendorName: "Kumar",
    vendorAvatar: "👴🏽",
    vendorQuote: "Decoction first, conversation second.",
    area: "Jayanagar",
    lat: 12.925,
    lng: 77.5838,
    emoji: "☕",
    hue: 25,
    dish: "filter-coffee",
    tags: ["Coffee", "Snacks"],
    veg: true,
    avgPrice: 30,
    timings: "6:00 AM – 9:00 PM",
    ratings: { taste: 4.4, hygiene: 4.3, value: 4.9, vibe: 4.0 },
    ratingCount: 190,
    verified: true,
    since: 2009,
    dishes: [
      { name: "Filter Coffee", price: 20 },
      { name: "Mangalore Bajji", price: 40 },
    ],
    aiSummary: "Strong, chicory-forward coffee at an unbeatable price. A neighbourhood institution.",
    campaignId: "c-kumar-boiler",
    reviews: [
      { userId: "meera", rating: 5, text: "₹20 for the best coffee in Jayanagar. No debate.", date: "2026-09-02" },
    ],
  },
  {
    id: "pema-momo-point",
    name: "Momo Point by Pema",
    vendorName: "Pema",
    vendorAvatar: "👩🏻‍🍳",
    vendorQuote: "I make momos the way my mother did in Darjeeling.",
    area: "Koramangala",
    lat: 12.9352,
    lng: 77.6245,
    emoji: "🥟",
    hue: 200,
    dish: "momos",
    tags: ["Momos", "Evening"],
    veg: false,
    avgPrice: 100,
    timings: "3:00 PM – 11:00 PM",
    ratings: { taste: 4.8, hygiene: 4.5, value: 4.6, vibe: 4.9 },
    ratingCount: 302,
    verified: true,
    suggestedBy: "ananya",
    since: 2021,
    dishes: [
      { name: "Chicken Steamed Momos", price: 100 },
      { name: "Veg Fried Momos", price: 90 },
      { name: "Thukpa", price: 120 },
    ],
    aiSummary:
      "Juicy, thin-skinned momos with a fiery red chutney. Reviewers often mention it's the closest to Darjeeling-style in the area.",
    reviews: [
      { userId: "karthik", rating: 5, text: "That chutney should be bottled and sold.", date: "2026-09-26" },
    ],
    campaignId: "c-pema-food-truck",
  },
  {
    id: "gowda-ragi-mudde",
    name: "Gowda's Ragi Mudde Stall",
    vendorName: "Basavaraj Gowda",
    vendorAvatar: "👨🏽‍🌾",
    vendorQuote: "Food from my village, for your city.",
    area: "HSR Layout",
    lat: 12.9116,
    lng: 77.6474,
    emoji: "🍲",
    hue: 90,
    dish: "ragi-mudde",
    tags: ["Meals", "Lunch"],
    veg: false,
    avgPrice: 120,
    timings: "12:00 PM – 3:30 PM",
    ratings: { taste: 4.5, hygiene: 3.9, value: 4.6, vibe: 3.8 },
    ratingCount: 88,
    verified: false,
    suggestedBy: "pratyush",
    since: 2023,
    dishes: [
      { name: "Ragi Mudde + Saaru", price: 90 },
      { name: "Naati Koli Saaru Meal", price: 150 },
    ],
    aiSummary:
      "Home-style ragi mudde with a rich country-chicken curry. Small but growing fan base, and still collecting vouches.",
    reviews: [
      { userId: "pratyush", rating: 5, text: "Tastes like a village kitchen. Found it by accident, now I'm a regular.", date: "2026-09-27" },
    ],
  },
  {
    id: "lakshmi-holige",
    name: "Lakshmi Holige Stall",
    vendorName: "Lakshmi",
    vendorAvatar: "👵🏽",
    vendorQuote: "Every holige is rolled by hand, the old way.",
    area: "Indiranagar",
    lat: 12.9784,
    lng: 77.6408,
    emoji: "🫓",
    hue: 50,
    dish: "holige",
    tags: ["Sweets", "Snacks"],
    veg: true,
    avgPrice: 40,
    timings: "10:00 AM – 8:00 PM",
    ratings: { taste: 4.8, hygiene: 4.7, value: 4.6, vibe: 4.2 },
    ratingCount: 145,
    verified: true,
    since: 2019,
    dishes: [
      { name: "Kayi Holige", price: 35 },
      { name: "Bele Holige", price: 35 },
      { name: "Holige + Ghee", price: 50 },
    ],
    aiSummary: "Thin, generous holige with plenty of ghee. Many order in bulk for festivals.",
    reviews: [
      { userId: "meera", rating: 5, text: "Tastes exactly like Ajji's. Ordered 40 for Ugadi.", date: "2026-08-30" },
    ],
  },
];

export const campaigns: Campaign[] = [
  {
    id: "c-manju-second-tawa",
    stallId: "manju-benne-dosa",
    title: "A second tawa to halve the weekend queue",
    shortGoal: "a second tawa",
    story:
      "For 12 years I've made every dosa on one tawa. On weekends people wait 20 minutes, and some leave. A second tawa and a helper means twice the dosas and no one goes home hungry.",
    goal: 60000,
    raised: 48600,
    backers: 87,
    endsInDays: 9,
    costBreakdown: [
      { item: "Heavy cast-iron tawa + burner", amount: 22000 },
      { item: "Extended steel counter", amount: 18000 },
      { item: "Helper wages (2 months)", amount: 20000 },
    ],
    revenueShare: { pctOfGrowth: 8, cap: 1.5, baselineMonthly: 210000 },
    milestones: [
      { title: "Fully funded", reward: "₹100 food credit", releasePct: 40, status: "in_progress" },
      { title: "Second tawa live", reward: "₹200 credit + Tawa Backer badge", releasePct: 40, status: "locked" },
      { title: "Revenue up 25%", reward: "₹300 credit + taste-score boost", releasePct: 20, status: "locked" },
    ],
    insight: {
      summary:
        "A strong, low-risk case: demand clearly exceeds capacity. The upgrade directly targets the #1 complaint (queues).",
      signals: [
        "Rating steady at 4.6+ for 18 months",
        "\"Queue\" mentioned in 58% of recent reviews",
        "Revenue reports consistent with UPI volume",
      ],
      risks: ["Single location", "Morning-only hours limit upside"],
    },
    updates: [
      { date: "2026-09-28", emoji: "🙏", text: "80% there! Thank you all. Got a quote for the tawa today." },
      { date: "2026-09-20", emoji: "📸", text: "Measured the space for the extended counter. It fits!" },
    ],
  },
  {
    id: "c-raju-clean-cart",
    stallId: "raju-chaat-corner",
    title: "Running water and a covered counter",
    shortGoal: "running water and a covered counter",
    story:
      "My chaat is loved, but people worry about hygiene. I want a cart with a water tank, a hand-wash tap and a covered glass counter so everyone can eat without a second thought.",
    goal: 45000,
    raised: 45000,
    backers: 112,
    endsInDays: 0,
    costBreakdown: [
      { item: "New cart with glass counter", amount: 30000 },
      { item: "Water tank + tap fitting", amount: 9000 },
      { item: "Steel serving ware", amount: 6000 },
    ],
    revenueShare: { pctOfGrowth: 10, cap: 1.5, baselineMonthly: 165000 },
    milestones: [
      { title: "Fully funded", reward: "₹100 food credit", releasePct: 50, status: "done" },
      { title: "New cart live", reward: "₹200 credit + Clean Cart badge", releasePct: 30, status: "in_progress" },
      { title: "Hygiene rating ≥ 4.5", reward: "₹250 credit", releasePct: 20, status: "locked" },
    ],
    insight: {
      summary:
        "Fixes the one weak spot of a top-rated stall. If the hygiene rating rises, more families and office crowds are likely to come.",
      signals: ["Highest review volume in VV Puram", "Taste 4.8, hygiene 3.6: a clear gap", "Funded in 11 days"],
      risks: ["Food Street footfall is seasonal"],
    },
    updates: [
      { date: "2026-09-29", emoji: "🛒", text: "Cart is being built! Fabricator says 10 more days." },
      { date: "2026-09-15", emoji: "🎉", text: "100% funded! I can't believe it. Thank you, Bengaluru." },
    ],
  },
  {
    id: "c-pema-food-truck",
    stallId: "pema-momo-point",
    title: "From cart to a small food truck",
    shortGoal: "a food truck",
    story:
      "Rain shuts my cart down for weeks every monsoon. A small second-hand food truck means I can cook in any weather and park near the tech parks at lunch.",
    goal: 250000,
    raised: 96000,
    backers: 141,
    endsInDays: 24,
    costBreakdown: [
      { item: "Second-hand mini truck", amount: 160000 },
      { item: "Kitchen fit-out", amount: 65000 },
      { item: "Permits + registration", amount: 25000 },
    ],
    revenueShare: { pctOfGrowth: 12, cap: 1.6, baselineMonthly: 240000 },
    milestones: [
      { title: "Fully funded", reward: "₹150 food credit", releasePct: 30, status: "in_progress" },
      { title: "Truck fitted & permitted", reward: "₹300 credit + Truck Crew badge", releasePct: 50, status: "locked" },
      { title: "Lunch service at tech park", reward: "₹300 credit + Founding Backer plaque", releasePct: 20, status: "locked" },
    ],
    insight: {
      summary:
        "Higher upside, higher risk. A truck unlocks monsoon months and a second daily service, but the goal is ambitious.",
      signals: ["Rating rose 4.3 → 4.6 in a year", "Fastest-growing stall in Koramangala", "Suggested and vouched by top critics"],
      risks: ["Large goal: 38% funded with 24 days left", "Permits can delay launch"],
    },
    updates: [{ date: "2026-09-27", emoji: "🚚", text: "Found a truck in good condition. Mechanic check on Monday." }],
  },
  {
    id: "c-bhai-tandoor",
    stallId: "shivajinagar-kebab-gaadi",
    title: "A proper tandoor for naan and tikka",
    shortGoal: "a proper tandoor",
    story:
      "Customers keep asking for rotis with their kebabs. A tandoor lets me add naan and tandoori dishes and stay open on weekend afternoons too.",
    goal: 80000,
    raised: 31200,
    backers: 46,
    endsInDays: 16,
    costBreakdown: [
      { item: "Clay tandoor + insulation", amount: 45000 },
      { item: "Exhaust hood", amount: 20000 },
      { item: "Utensils + first stock", amount: 15000 },
    ],
    revenueShare: { pctOfGrowth: 9, cap: 1.5, baselineMonthly: 320000 },
    milestones: [
      { title: "Fully funded", reward: "₹100 food credit", releasePct: 40, status: "in_progress" },
      { title: "Tandoor installed", reward: "₹250 credit + Tandoor Club badge", releasePct: 40, status: "locked" },
      { title: "Weekend afternoons open", reward: "₹200 credit", releasePct: 20, status: "locked" },
    ],
    insight: {
      summary: "Adds a new menu category that customers keep asking for. Moderate risk, mostly around execution.",
      signals: ["\"Roti\" or \"naan\" requested in 31% of reviews", "Strong late-night demand"],
      risks: ["Space constraints on the street", "Needs smoke management"],
    },
    updates: [],
  },
];

campaigns.push({
  id: "c-kumar-boiler",
  stallId: "kumar-filter-coffee",
  title: "A bigger decoction boiler for the evening rush",
  shortGoal: "a bigger decoction boiler",
  story:
    "Every evening the decoction ran out by 7 PM and people went home without coffee. A bigger brass boiler means fresh decoction till closing time.",
  goal: 30000,
  raised: 30000,
  backers: 58,
  endsInDays: 0,
  costBreakdown: [
    { item: "Brass decoction boiler", amount: 18000 },
    { item: "Milk warmer + burner", amount: 8000 },
    { item: "Steel tumblers & davaras", amount: 4000 },
  ],
  revenueShare: { pctOfGrowth: 10, cap: 1.5, baselineMonthly: 120000 },
  milestones: [
    { title: "Fully funded", reward: "₹100 food credit", releasePct: 50, status: "done" },
    { title: "New boiler running", reward: "₹100 credit + Decoction Backer badge", releasePct: 30, status: "done" },
    { title: "Evening sales up 25%", reward: "₹100 credit", releasePct: 20, status: "done" },
  ],
  insight: {
    summary: "Completed. Evening sales are up about 40% since the boiler arrived, and backers are being paid monthly.",
    signals: ["All milestones verified", "Revenue share paid 4 months in a row"],
    risks: [],
  },
  updates: [
    { date: "2026-06-12", emoji: "☕", text: "New boiler running! Evening sales up 40% this month." },
    { date: "2026-03-02", emoji: "🎉", text: "Funded in 6 days. Thank you!" },
  ],
});

export const critics: Critic[] = [
  {
    id: "pratyush",
    name: "Pratyush",
    handle: "pratyush",
    avatar: "🧑🏽",
    area: "HSR Layout",
    persona: "Mudde Hunter · HSR Explorer",
    tasteScore: 742,
    reviews: 38,
    stallsSuggested: 3,
    followers: 126,
    badges: [
      { emoji: "🔍", title: "Found It First" },
      { emoji: "🎯", title: "Early Backer" },
      { emoji: "🛒", title: "Clean Cart" },
    ],
  },
  {
    id: "ananya",
    name: "Ananya Rao",
    handle: "ananya",
    avatar: "👩🏽",
    area: "Koramangala",
    persona: "Momo Whisperer · Koramangala Scout",
    tasteScore: 1284,
    reviews: 142,
    stallsSuggested: 11,
    followers: 2310,
    badges: [
      { emoji: "🔍", title: "Found It First" },
      { emoji: "🥟", title: "Momo Connoisseur" },
      { emoji: "🏆", title: "Top 10 Critic" },
    ],
  },
  {
    id: "karthik",
    name: "Karthik S",
    handle: "karthik",
    avatar: "🧔🏽",
    area: "VV Puram",
    persona: "Chaat Purist · Food Street Regular",
    tasteScore: 1105,
    reviews: 97,
    stallsSuggested: 6,
    followers: 1540,
    badges: [
      { emoji: "🌶️", title: "Spice Lord" },
      { emoji: "🎯", title: "Early Backer" },
    ],
  },
  {
    id: "meera",
    name: "Meera Iyer",
    handle: "meera",
    avatar: "👵🏽",
    area: "Malleshwaram",
    persona: "Filter-Coffee Purist · Malleshwaram Loyalist",
    tasteScore: 986,
    reviews: 121,
    stallsSuggested: 4,
    followers: 890,
    badges: [
      { emoji: "☕", title: "Decoction Expert" },
      { emoji: "🌅", title: "Breakfast Club" },
    ],
  },
  {
    id: "rahul",
    name: "Rahul M",
    handle: "rahul",
    avatar: "👨🏽",
    area: "Shivajinagar",
    persona: "Late-Night Kebab Crawler",
    tasteScore: 812,
    reviews: 64,
    stallsSuggested: 2,
    followers: 455,
    badges: [{ emoji: "🌙", title: "Night Owl" }],
  },
];

export const CURRENT_USER_ID = "pratyush";

export const myBackings: Backing[] = [
  { campaignId: "c-kumar-boiler", amount: 1000, earned: 640, credit: 300 },
  { campaignId: "c-raju-clean-cart", amount: 1000, earned: 0, credit: 100 },
  { campaignId: "c-manju-second-tawa", amount: 2500, earned: 0, credit: 0 },
];

export const walletHistory: WalletTxn[] = [
  { date: "2026-09-30", label: "Revenue share · Kumar Filter Coffee (Sep)", amount: 160, kind: "earning" },
  { date: "2026-09-16", label: "Food credit · Raju Chaat Corner fully funded", amount: 100, kind: "credit" },
  { date: "2026-09-12", label: "Backed Manju's Benne Dosa Cart", amount: -2500, kind: "backing" },
  { date: "2026-09-05", label: "Backed Raju Chaat Corner", amount: -1000, kind: "backing" },
  { date: "2026-08-31", label: "Revenue share · Kumar Filter Coffee (Aug)", amount: 160, kind: "earning" },
  { date: "2026-08-20", label: "Withdrawn to UPI · pratyush@okaxis", amount: -200, kind: "withdrawal" },
  { date: "2026-07-31", label: "Revenue share · Kumar Filter Coffee (Jul)", amount: 160, kind: "earning" },
  { date: "2026-06-30", label: "Revenue share · Kumar Filter Coffee (Jun)", amount: 160, kind: "earning" },
  { date: "2026-06-12", label: "Food credit · Kumar boiler milestones", amount: 300, kind: "credit" },
  { date: "2026-03-01", label: "Backed Kumar Filter Coffee Stand", amount: -1000, kind: "backing" },
];

export const WITHDRAWN_SO_FAR = 200;

export function getStall(id: string) {
  return stalls.find((s) => s.id === id);
}

export function getCampaign(id: string) {
  return campaigns.find((c) => c.id === id);
}

export function getCritic(id: string) {
  return critics.find((c) => c.id === id);
}

// Demo vendor view: the dashboard Manjunath would see.
export const DEMO_VENDOR_STALL_ID = "manju-benne-dosa";

export const demoVendorBackers: VendorBacker[] = [
  { name: "Ananya Rao", handle: "ananya", avatar: "👩🏽", amount: 2500, date: "2026-09-28" },
  { name: "Pratyush", handle: "pratyush", avatar: "🧑🏽", amount: 2500, date: "2026-09-12" },
  { name: "Karthik S", handle: "karthik", avatar: "🧔🏽", amount: 1000, date: "2026-09-10" },
  { name: "Meera Iyer", handle: "meera", avatar: "👵🏽", amount: 5000, date: "2026-09-08" },
  { name: "Rahul M", handle: "rahul", avatar: "👨🏽", amount: 500, date: "2026-09-04" },
];

export const demoVendorRedemptions: VendorRedemption[] = [
  { name: "Meera Iyer", avatar: "👵🏽", amount: 100, date: "2026-09-30" },
  { name: "Karthik S", avatar: "🧔🏽", amount: 50, date: "2026-09-29" },
];
