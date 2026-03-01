/**
 * server/routes/ai.js
 * Unified AI router — all 19 AI endpoints served from /api/ai/*
 * Powered by Groq (Llama 3.3 70B) + OpenWeatherMap
 */
import { Router } from 'express';
import { ask, stream } from '../services/groq.js';
import { getWeather } from '../services/weather.js';
import { flights, buses, cabs, offers, bookings, users } from '../data/store.js';

// Hotels data (local to hotels route, re-defined here for AI context)
const hotels = [
    { id: 'HT001', name: 'The Grand Marigold Palace', city: 'Jaipur', rating: 5, pricePerNight: 8500, amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi', 'Gym'] },
    { id: 'HT002', name: 'Serenity Beach Resort', city: 'Goa', rating: 4.5, pricePerNight: 6200, amenities: ['Beach Access', 'Pool', 'Spa', 'Restaurant'] },
    { id: 'HT003', name: 'The Oberoi Highlands', city: 'Shimla', rating: 5, pricePerNight: 11500, amenities: ['Mountain View', 'Spa', 'Restaurant', 'WiFi'] },
    { id: 'HT004', name: 'Mumbai Central Boutique', city: 'Mumbai', rating: 4, pricePerNight: 4500, amenities: ['WiFi', 'Restaurant', 'Gym'] },
    { id: 'HT005', name: 'Backwater Bliss Kerala', city: 'Alleppey', rating: 4.8, pricePerNight: 7800, amenities: ['Backwater View', 'Houseboat', 'Spa'] },
    { id: 'HT006', name: 'Taj Mahal Delhi', city: 'Delhi', rating: 5, pricePerNight: 13000, amenities: ['Pool', 'Spa', '3 Restaurants', 'WiFi'] },
    { id: 'HT007', name: 'Ooty Misty Retreat', city: 'Ooty', rating: 4.3, pricePerNight: 3800, amenities: ['Garden', 'Restaurant', 'Fireplace', 'WiFi'] },
    { id: 'HT008', name: 'Udaipur Lake Palace View', city: 'Udaipur', rating: 4.9, pricePerNight: 9500, amenities: ['Lake View', 'Pool', 'Spa', 'Fine Dining'] },
];

const router = Router();

// ─── Shared system context helpers ────────────────────────────────────────────
const ROUTESYNC_CONTEXT = `You are RouteSync AI — a smart, friendly travel assistant for RouteSync, India's premier travel booking platform. You help users plan trips, find deals, and get travel advice. Always respond in a helpful, concise, and enthusiastic tone. When listing things, use bullet points. Currency is INR (₹). Keep responses under 300 words unless generating detailed itineraries.`;

const travelDestinations = ['Goa', 'Kerala', 'Rajasthan', 'Manali', 'Shimla', 'Andaman', 'Ooty', 'Coorg', 'Jaipur', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata', 'Chennai', 'Agra', 'Varanasi', 'Rishikesh', 'Leh', 'Darjeeling'];

// ─── 1. CHATBOT (SSE Streaming) ────────────────────────────────────────────────
// POST /api/ai/chat
router.post('/chat', async (req, res) => {
    const { messages = [], page = '', userBookings = [] } = req.body;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemPrompt = `${ROUTESYNC_CONTEXT}

Current context:
- User is on page: ${page || 'homepage'}
- User has ${userBookings.length} bookings
- Available flights: ${flights.length}, hotels: ${hotels.length}
- Active offers: ${offers.filter(o => o.validUntil >= new Date().toISOString().split('T')[0]).length}

You can help with: finding flights/hotels/trains/buses/cabs/holidays, answering travel questions, suggesting destinations, explaining offers, and helping with bookings. 
If asked about specific flights or hotels, summarize what's available in the data above.`;

    try {
        await stream(systemPrompt, messages, res);
    } catch (e) {
        res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
        res.end();
    }
});

// ─── 2. TRIP PLANNER ──────────────────────────────────────────────────────────
// POST /api/ai/trip-plan
router.post('/trip-plan', async (req, res) => {
    const { destination, days, budget, style, travelers, groupDetails } = req.body;
    if (!destination || !days || !budget) return res.status(400).json({ success: false, message: 'destination, days, and budget are required' });

    const systemPrompt = `${ROUTESYNC_CONTEXT}
You generate detailed JSON trip itineraries. Always respond with valid JSON only, no markdown.`;

    const userMsg = `Create a ${days}-day trip to ${destination} for ${travelers || 1} traveler(s) with a total budget of ₹${budget}.
Travel style: ${style || 'Balanced'}.
${groupDetails ? `Group preferences: ${groupDetails}` : ''}

Available transport from RouteSync: flights starting ₹3,000, hotels ₹2,000-₹15,000/night, holiday packages available.

Return a JSON object with this exact structure:
{
  "title": "Trip name",
  "destination": "${destination}",
  "duration": "${days} Days / ${days - 1} Nights",
  "totalBudget": ${budget},
  "budgetBreakdown": { "flights": 0, "hotels": 0, "food": 0, "activities": 0, "miscellaneous": 0 },
  "highlights": ["highlight1", "highlight2", "highlight3", "highlight4", "highlight5"],
  "bestTimeToVisit": "Month range",
  "weatherNote": "brief weather note",
  "packingTips": ["tip1", "tip2", "tip3"],
  "itinerary": [
    { "day": 1, "title": "Day title", "description": "What to do", "activities": ["activity1", "activity2"], "meals": "Recommended food", "estimatedCost": 0 }
  ],
  "travelTips": ["tip1", "tip2", "tip3"],
  "emergencyContacts": { "police": "100", "ambulance": "108", "touristHelpline": "1800-11-1363" }
}`;

    try {
        const plan = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.8 });
        res.json({ success: true, data: plan });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 3. NATURAL LANGUAGE SEARCH PARSER ────────────────────────────────────────
// POST /api/ai/parse-search
router.post('/parse-search', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'query is required' });

    const systemPrompt = `You parse natural language travel search queries into structured JSON. Always return valid JSON only, no markdown, no explanation.`;
    const today = new Date().toISOString().split('T')[0];

    const userMsg = `Parse this travel query: "${query}"
Today's date: ${today}

Return JSON:
{
  "type": "flight|hotel|train|bus|cab|holiday",
  "from": "city name or null",
  "to": "city name or null",
  "date": "YYYY-MM-DD or null",
  "returnDate": "YYYY-MM-DD or null",
  "passengers": 1,
  "maxPrice": null,
  "stops": "all|nonstop or null",
  "class": "Economy|Business|First or null",
  "nights": null,
  "confidence": 0.0-1.0,
  "summary": "Human readable: what the user wants"
}`;

    try {
        const parsed = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.2 });
        res.json({ success: true, data: parsed });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 4. FARE PREDICTOR ────────────────────────────────────────────────────────
// POST /api/ai/fare-predict
router.post('/fare-predict', async (req, res) => {
    const { from, to, date, currentPrice } = req.body;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to required' });

    // Compute real stats from store
    const routeFlights = flights.filter(f =>
        f.from?.toLowerCase().includes(from.toLowerCase()) ||
        f.to?.toLowerCase().includes(to.toLowerCase())
    );
    const prices = routeFlights.map(f => f.price);
    const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : currentPrice;
    const minPrice = prices.length ? Math.min(...prices) : currentPrice;
    const maxPrice = prices.length ? Math.max(...prices) : currentPrice;

    const systemPrompt = `${ROUTESYNC_CONTEXT} You analyze flight price trends and give booking advice. Return valid JSON only.`;
    const userMsg = `Analyze price trend for ${from} → ${to} on ${date || 'flexible dates'}.
Current price: ₹${currentPrice}, Route avg: ₹${avgPrice}, Min: ₹${minPrice}, Max: ₹${maxPrice}.
Days until travel: ${date ? Math.max(0, Math.ceil((new Date(date) - new Date()) / 86400000)) : 'unknown'}

Return JSON: { "recommendation": "book_now|wait|flexible", "confidence": 0-100, "priceDirection": "rising|falling|stable", "reasoning": "2 sentence explanation", "savingsEstimate": "₹X you could save or lose", "urgencyLevel": "low|medium|high" }`;

    try {
        const prediction = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.3 });
        res.json({ success: true, data: { ...prediction, currentPrice, avgPrice, minPrice, maxPrice } });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 5. WEATHER ───────────────────────────────────────────────────────────────
// GET /api/ai/weather/:city
router.get('/weather/:city', async (req, res) => {
    try {
        const weather = await getWeather(req.params.city);
        res.json({ success: true, data: weather });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 6. BUDGET OPTIMIZER ─────────────────────────────────────────────────────
// POST /api/ai/budget
router.post('/budget', async (req, res) => {
    const { destination, days, totalBudget, travelers = 1, style = 'Balanced' } = req.body;
    if (!destination || !totalBudget) return res.status(400).json({ success: false, message: 'destination and totalBudget required' });

    const systemPrompt = `${ROUTESYNC_CONTEXT} You are a budget optimization expert. Return valid JSON only.`;
    const userMsg = `Optimize a ₹${totalBudget} travel budget for ${travelers} traveler(s) going to ${destination} for ${days || 3} days. Travel style: ${style}.

Return JSON:
{
  "totalBudget": ${totalBudget},
  "perPersonBudget": ${Math.round(totalBudget / travelers)},
  "breakdown": {
    "flights": { "amount": 0, "percentage": 0, "tip": "advice" },
    "accommodation": { "amount": 0, "percentage": 0, "tip": "advice" },
    "food": { "amount": 0, "percentage": 0, "tip": "advice" },
    "activities": { "amount": 0, "percentage": 0, "tip": "advice" },
    "transport": { "amount": 0, "percentage": 0, "tip": "advice" },
    "miscellaneous": { "amount": 0, "percentage": 0, "tip": "advice" }
  },
  "savingsTips": ["tip1", "tip2", "tip3"],
  "budgetRating": "Budget|Mid-range|Premium",
  "verdict": "One sentence overall assessment"
}`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.5 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 7. TRIP HEALTH SCORE ────────────────────────────────────────────────────
// POST /api/ai/health-check
router.post('/health-check', async (req, res) => {
    const { type, item, passengers, totalAmount, date, destination } = req.body;

    const weather = destination ? await getWeather(destination).catch(() => null) : null;
    const avgPrice = type === 'flight' ? Math.round(flights.reduce((s, f) => s + f.price, 0) / flights.length) : 0;
    const valuePct = avgPrice ? Math.round(((avgPrice - totalAmount) / avgPrice) * 100) : 0;

    const systemPrompt = `${ROUTESYNC_CONTEXT} You audit travel bookings and return a health score JSON.`;
    const userMsg = `Audit this booking:
Type: ${type}, Amount: ₹${totalAmount}, Date: ${date || 'not set'}, Destination: ${destination || 'unknown'}
Item details: ${JSON.stringify(item || {})}
Weather: ${weather ? `${weather.emoji} ${weather.temp}°C ${weather.condition}` : 'unknown'}
Price vs average: ${valuePct > 0 ? `${valuePct}% below average (great deal)` : `${Math.abs(valuePct)}% above average`}
Passengers: ${passengers || 1}

Return JSON:
{
  "score": 0-100,
  "grade": "A|B|C|D",
  "verdict": "Short positive/neutral/warning verdict",
  "checks": [
    { "icon": "✅|⚠️|❌|ℹ️", "label": "Check name", "status": "ok|warning|info", "message": "Detail" }
  ],
  "recommendation": "One actionable tip"
}`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.3 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 8. RE-BOOKING ASSISTANT ─────────────────────────────────────────────────
// POST /api/ai/rebook
router.post('/rebook', async (req, res) => {
    const { cancelledBooking } = req.body;
    const type = cancelledBooking?.type || 'holiday';
    const destination = cancelledBooking?.item?.destination || cancelledBooking?.item?.to || 'India';

    const systemPrompt = `${ROUTESYNC_CONTEXT} You suggest travel alternatives after cancellations. Return valid JSON only.`;
    const userMsg = `A user cancelled a ${type} booking to ${destination}. Suggest 3 alternative Indian destinations they would love.
Available holiday destinations: ${travelDestinations.slice(0, 10).join(', ')}.

Return JSON:
{
  "message": "Empathetic 1-sentence message",
  "alternatives": [
    {
      "destination": "City",
      "reason": "Why they'd love it",
      "category": "Beach|Mountain|Heritage|Nature|City",
      "estimatedBudget": "₹X - ₹Y",
      "bestFor": "Type of traveler",
      "emoji": "🏖️"
    }
  ]
}`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.8 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 9. ITINERARY GENERATOR ──────────────────────────────────────────────────
// POST /api/ai/itinerary
router.post('/itinerary', async (req, res) => {
    const { booking, destination, days = 3 } = req.body;

    const weather = destination ? await getWeather(destination).catch(() => null) : null;

    const systemPrompt = `${ROUTESYNC_CONTEXT} You generate detailed post-booking travel itineraries. Return valid JSON only.`;
    const userMsg = `Generate a complete itinerary for:
Booking: ${JSON.stringify(booking || {})}
Destination: ${destination}
Duration: ${days} days
Weather forecast: ${weather ? `${weather.emoji} ${weather.temp}°C, ${weather.condition}` : 'Not available'}

Return JSON:
{
  "title": "Trip title",
  "destination": "${destination}",
  "checklist": ["item1", "item2", "item3", "item4", "item5"],
  "packingList": { "clothing": [], "documents": [], "essentials": [], "electronics": [] },
  "itinerary": [{ "day": 1, "title": "", "morning": "", "afternoon": "", "evening": "", "tips": "" }],
  "emergencyContacts": { "police": "100", "ambulance": "108", "tourism": "1800-11-1363" },
  "localPhrases": [{ "phrase": "", "meaning": "" }],
  "mustEat": ["dish1", "dish2", "dish3"],
  "weatherTip": "${weather?.tip || 'Check local weather before your trip'}"
}`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.7 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 10. REVIEW GENERATOR ──────────────────────────────────────────────────
// POST /api/ai/review
router.post('/review', async (req, res) => {
    const { type, destination, rating, bestPart, improvement } = req.body;
    if (!rating || !bestPart) return res.status(400).json({ success: false, message: 'rating and bestPart required' });

    const systemPrompt = `${ROUTESYNC_CONTEXT} You help travelers write polished, authentic reviews. Return valid JSON only.`;
    const userMsg = `Write a travel review for:
Type: ${type || 'trip'}, Destination: ${destination || 'this destination'}
Rating: ${rating}/5 stars, Best part: "${bestPart}", Could improve: "${improvement || 'nothing'}"

Return JSON: { "title": "Catchy review title", "review": "3-paragraph authentic review (150-200 words)", "tags": ["tag1", "tag2", "tag3"], "rating": ${rating} }`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.9 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 11. FOOD & CULTURE BRIEFING ─────────────────────────────────────────────
// GET /api/ai/culture/:destination
router.get('/culture/:destination', async (req, res) => {
    const { destination } = req.params;
    const systemPrompt = `${ROUTESYNC_CONTEXT} You provide cultural briefings for Indian travel destinations. Return valid JSON only.`;
    const userMsg = `Give a cultural briefing for ${destination}, India. Return JSON:
{
  "greeting": "Local greeting phrase",
  "language": "Primary language",
  "mustEat": [{ "name": "", "description": "", "whereToFind": "" }],
  "customs": ["custom1", "custom2", "custom3"],
  "dressCode": "What to wear",
  "tipping": "Tipping culture",
  "religiousSites": ["site1", "site2"],
  "doAndDont": { "do": ["do1", "do2", "do3"], "dont": ["dont1", "dont2", "dont3"] },
  "bestShopping": ["item1", "item2"]
}`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.6 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 12. NEIGHBORHOOD ANALYZER ──────────────────────────────────────────────
// GET /api/ai/neighborhood/:hotelId
router.get('/neighborhood/:hotelId', async (req, res) => {
    const hotel = hotels.find(h => h.id === req.params.hotelId);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

    const systemPrompt = `${ROUTESYNC_CONTEXT} You analyze hotel neighborhoods. Return valid JSON only.`;
    const userMsg = `Analyze the neighborhood for: ${hotel.name} in ${hotel.city || hotel.address}, India.

Return JSON:
{
  "safety": { "score": 85, "label": "Very Safe", "note": "brief note" },
  "walkability": { "score": 70, "label": "Walkable", "note": "brief note" },
  "transport": { "score": 80, "label": "Well Connected", "note": "brief note" },
  "nightlife": { "score": 60, "label": "Moderate", "note": "brief note" },
  "nearbyAttractions": [{ "name": "", "distance": "", "type": "" }],
  "bestFor": ["families", "couples", "business travelers"],
  "areaType": "Beach resort area / Heritage zone / Business district / etc.",
  "overallScore": 78,
  "verdict": "One sentence summary"
}`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.5 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 13. LOCAL PHRASEBOOK ────────────────────────────────────────────────────
// GET /api/ai/phrasebook/:destination
router.get('/phrasebook/:destination', async (req, res) => {
    const { destination } = req.params;
    const systemPrompt = `${ROUTESYNC_CONTEXT} You create travel phrasebooks. Return valid JSON only.`;
    const userMsg = `Create a phrasebook for ${destination}, India. Include the primary local language.
Return JSON: { "language": "Language name", "script": "Script name", "phrases": [{ "english": "", "local": "", "pronunciation": "", "category": "greeting|food|transport|emergency|shopping" }] }
Include exactly 20 phrases covering greetings, food, transport, shopping, emergency, and courtesy.`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.5 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 14. DESTINATION PULSE ──────────────────────────────────────────────────
// GET /api/ai/pulse/:destination
router.get('/pulse/:destination', async (req, res) => {
    const { destination } = req.params;
    const month = new Date().toLocaleString('en-IN', { month: 'long' });
    const systemPrompt = `${ROUTESYNC_CONTEXT} You provide real-time-style destination insights. Return valid JSON only.`;
    const userMsg = `Give a destination pulse for ${destination} in ${month}. Return JSON:
{
  "crowdLevel": "Low|Moderate|High|Peak",
  "crowdScore": 60,
  "season": "Off-season|Shoulder|Peak",
  "events": [{ "name": "", "date": "", "description": "" }],
  "travelAdvisory": { "level": "Safe|Caution|Avoid", "note": "" },
  "visaInfo": "Visa requirements for Indian tourists",
  "trending": true,
  "trendReason": "Why trending or not",
  "bestAreas": ["area1", "area2"],
  "avoidAreas": ["area to avoid or empty"],
  "localTip": "Insider tip for this month"
}`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.6 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 15. TRAVELER DNA PROFILE ────────────────────────────────────────────────
// POST /api/ai/dna
router.post('/dna', async (req, res) => {
    const { userId } = req.body;
    const userBookings = bookings.filter(b => b.userId === userId && b.status === 'confirmed');
    if (userBookings.length < 1) return res.json({ success: true, data: null, message: 'Need at least 1 booking to generate DNA' });

    const summary = userBookings.map(b => `${b.type} to ${b.details?.to || b.details?.destination || 'unknown'}, ₹${b.totalAmount}`).join('; ');
    const systemPrompt = `${ROUTESYNC_CONTEXT} You analyze traveler behavior and create personas. Return valid JSON only.`;
    const userMsg = `Analyze this traveler's booking history: ${summary}
Create their Traveler DNA profile. Return JSON:
{
  "persona": "The Adventure Seeker",
  "personaEmoji": "🏔️",
  "description": "2-3 sentence description",
  "traits": ["trait1", "trait2", "trait3", "trait4"],
  "favoriteType": "Beach|Mountain|Heritage|Adventure|Luxury",
  "budgetStyle": "Budget|Mid-range|Premium|Luxury",
  "travelFrequency": "Frequent|Occasional|Rare",
  "topDestinations": ["dest1", "dest2", "dest3"],
  "nextRecommendations": [{ "destination": "", "reason": "", "bestTime": "", "estimatedBudget": "" }],
  "travelScore": 75
}`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.7 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 16. TRAVEL BUDDY MATCHER ────────────────────────────────────────────────
// POST /api/ai/buddies/register
router.post('/buddies/register', async (req, res) => {
    const { userId, destination, dates, interests, ageGroup } = req.body;
    if (!destination) return res.status(400).json({ success: false, message: 'destination required' });
    // Store in memory (in production: DB)
    if (!global.travelBuddies) global.travelBuddies = [];
    const existing = global.travelBuddies.findIndex(b => b.userId === userId);
    const entry = { userId, destination, dates, interests, ageGroup, registeredAt: new Date().toISOString() };
    if (existing >= 0) global.travelBuddies[existing] = entry;
    else global.travelBuddies.push(entry);
    res.json({ success: true, message: 'Registered as travel buddy seeker', data: entry });
});

// POST /api/ai/buddies/match
router.post('/buddies/match', async (req, res) => {
    const { userId, destination, interests, ageGroup } = req.body;
    const potential = (global.travelBuddies || []).filter(b => b.userId !== userId && b.destination?.toLowerCase() === destination?.toLowerCase());

    const systemPrompt = `${ROUTESYNC_CONTEXT} You match solo travelers. Return valid JSON only.`;
    const userMsg = `Find travel buddy matches for someone going to ${destination}, interests: ${interests}, age group: ${ageGroup}.
Potential matches: ${JSON.stringify(potential.slice(0, 5))}
Return JSON: { "matches": [{ "userId": "", "compatibilityScore": 85, "sharedInterests": [], "reason": "" }], "tips": ["tip1", "tip2"] }`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.6 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ─── 17. BEST TIME TO BOOK ────────────────────────────────────────────────────
// GET /api/ai/best-time/:from/:to
router.get('/best-time/:from/:to', async (req, res) => {
    const { from, to } = req.params;
    const routeFlights = flights.filter(f =>
        (f.from?.toLowerCase().includes(from.toLowerCase()) || f.fromCode?.toLowerCase() === from.toLowerCase()) &&
        (f.to?.toLowerCase().includes(to.toLowerCase()) || f.toCode?.toLowerCase() === to.toLowerCase())
    );
    const avgP = routeFlights.length ? Math.round(routeFlights.reduce((s, f) => s + f.price, 0) / routeFlights.length) : 5000;

    // Generate 6-week heatmap
    const heatmap = Array.from({ length: 42 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dow = d.getDay(); // 0=Sun
        const weekFactor = (dow === 5 || dow === 6 || dow === 0) ? 1.15 : 1.0;
        const proximityFactor = i < 3 ? 1.25 : i < 7 ? 1.1 : i < 14 ? 0.95 : i < 21 ? 0.9 : i < 30 ? 1.0 : 1.05;
        const price = Math.round(avgP * weekFactor * proximityFactor * (0.9 + Math.random() * 0.2));
        const level = price < avgP * 0.9 ? 'cheap' : price > avgP * 1.1 ? 'expensive' : 'normal';
        return { date: dateStr, price, level };
    });

    res.json({ success: true, data: { from, to, averagePrice: avgP, heatmap, tip: `Best days to book ${from} → ${to}: Tuesdays and Wednesdays typically have the lowest fares. Avoid weekends.` } });
});

// ─── 18. MOOD-BASED SEARCH ────────────────────────────────────────────────────
// GET /api/ai/mood/:mood
const moodMap = {
    beach: ['Goa', 'Andaman', 'Kerala', 'Pondicherry', 'Lakshadweep'],
    adventure: ['Manali', 'Leh', 'Rishikesh', 'Darjeeling', 'Sikkim'],
    heritage: ['Rajasthan', 'Agra', 'Varanasi', 'Hampi', 'Mysore'],
    nature: ['Coorg', 'Ooty', 'Munnar', 'Kaziranga', 'Valley of Flowers'],
    romantic: ['Udaipur', 'Shimla', 'Andaman', 'Goa', 'Alleppey'],
    family: ['Goa', 'Nainital', 'Ooty', 'Mysore', 'Jaipur'],
};

router.get('/mood/:mood', async (req, res) => {
    const { mood } = req.params;
    const destinations = moodMap[mood.toLowerCase()] || moodMap.beach;

    // Filter holiday packages matching mood destinations
    const { default: holidayData } = await import('../routes/holidays.js').catch(() => ({ default: null }));
    // Directly use inline data since holidays are in the route file
    const moodPackages = destinations.map(d => ({
        destination: d,
        mood: mood,
        emoji: { beach: '🏖️', adventure: '🏔️', heritage: '🏛️', nature: '🌿', romantic: '💑', family: '👨‍👩‍👧' }[mood] || '✈️',
        searchUrl: `/holidays?destination=${encodeURIComponent(d)}`,
    }));

    res.json({ success: true, data: { mood, destinations: moodPackages } });
});

// ─── 19. GROUP TRIP COORDINATOR ──────────────────────────────────────────────
// POST /api/ai/group-plan
router.post('/group-plan', async (req, res) => {
    const { members, destination, dates } = req.body;
    if (!members?.length || !destination) return res.status(400).json({ success: false, message: 'members and destination required' });

    const totalBudget = members.reduce((s, m) => s + (m.budget || 5000), 0);
    const avgBudget = Math.round(totalBudget / members.length);

    const systemPrompt = `${ROUTESYNC_CONTEXT} You coordinate group travel planning. Return valid JSON only.`;
    const userMsg = `Plan a group trip to ${destination} for ${members.length} people.
Members: ${JSON.stringify(members)}
Total budget: ₹${totalBudget}, Per person average: ₹${avgBudget}
Dates: ${dates || 'flexible'}

Return JSON:
{
  "groupSummary": "Brief group profile",
  "recommendedHotelTier": "Budget|Mid-range|Premium",
  "sharedActivities": ["activity1", "activity2", "activity3"],
  "budgetConflicts": "Note any budget gaps or null",
  "groupSplitSuggestion": "How to fairly split costs",
  "bestRoomConfig": "Room configuration for the group",
  "coordinationTips": ["tip1", "tip2", "tip3"],
  "itinerarySuggestion": [{ "day": 1, "groupActivity": "", "soloOptions": "" }]
}`;

    try {
        const result = await ask(systemPrompt, userMsg, { jsonMode: true, temperature: 0.7 });
        res.json({ success: true, data: result });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

export default router;
