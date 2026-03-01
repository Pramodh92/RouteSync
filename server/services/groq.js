/**
 * server/services/groq.js
 * Shared Groq (Llama 3.3 70B) client for all AI features.
 * Set GROQ_API_KEY in server/.env
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

function headers() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    };
}

// ─── Single-turn ask (returns text or parsed JSON) ─────────────────────────────
export async function ask(systemPrompt, userMessage, { jsonMode = false, temperature = 0.7 } = {}) {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        throw new Error('GROQ_API_KEY not set in server/.env');
    }
    const body = {
        model: MODEL,
        temperature,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ],
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };
    const res = await fetch(GROQ_API_URL, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Groq API error ${res.status}`);
    }
    const data = await res.json();
    const text = data.choices[0].message.content;
    return jsonMode ? JSON.parse(text) : text;
}

// ─── Streaming (SSE) for chatbot ───────────────────────────────────────────────
export async function stream(systemPrompt, messages, expressRes) {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        expressRes.write(`data: ${JSON.stringify({ error: 'GROQ_API_KEY not set' })}\n\n`);
        expressRes.end();
        return;
    }
    const body = {
        model: MODEL,
        temperature: 0.8,
        stream: true,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
    };
    const groqRes = await fetch(GROQ_API_URL, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
    if (!groqRes.ok) {
        expressRes.write(`data: ${JSON.stringify({ error: 'Groq stream error' })}\n\n`);
        expressRes.end();
        return;
    }
    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: ') && !l.includes('[DONE]'));
        for (const line of lines) {
            try {
                const json = JSON.parse(line.slice(6));
                const token = json.choices[0]?.delta?.content;
                if (token) expressRes.write(`data: ${JSON.stringify({ token })}\n\n`);
            } catch { }
        }
    }
    expressRes.write('data: [DONE]\n\n');
    expressRes.end();
}
