/**
 * src/components/ai/DealScore.jsx
 * AI Deal Score badge — compact badge shown on every listing card.
 * Score is computed server-side and passed as a prop.
 */
import React from 'react';
import { Flame, TrendingDown, Minus } from 'lucide-react';

// Compute a deal score client-side (0-100) when server doesn't provide one
export function computeDealScore(item, type = 'flight') {
    let score = 60; // baseline
    const price = item.price || item.pricePerNight || item.basePrice || 0;

    // Availability bonus
    const seats = item.seatsLeft || item.availableSeats || item.available || 10;
    if (seats <= 3) score -= 10; // few seats = higher demand, worse deal
    else if (seats >= 15) score += 8;

    // Rating bonus (hotels/buses)
    if (item.rating >= 4.5) score += 12;
    else if (item.rating >= 4.0) score += 6;
    else if (item.rating < 3.5) score -= 8;

    // Price vs originalPrice (hotels)
    if (item.originalPrice && item.originalPrice > price) {
        const disc = Math.round(((item.originalPrice - price) / item.originalPrice) * 100);
        score += Math.min(disc, 20);
    }

    // Amenities bonus
    const amenities = item.amenities?.length || 0;
    score += Math.min(amenities * 2, 10);

    return Math.min(100, Math.max(0, Math.round(score)));
}

export default function DealScore({ score, compact = false }) {
    if (score === undefined || score === null) return null;

    const config =
        score >= 85 ? { color: 'bg-red-500', text: 'text-white', label: 'Hot Deal', icon: Flame, ring: 'ring-red-300' } :
            score >= 70 ? { color: 'bg-green-500', text: 'text-white', label: 'Great Deal', icon: TrendingDown, ring: 'ring-green-300' } :
                score >= 50 ? { color: 'bg-yellow-400', text: 'text-charcoal', label: 'Fair Deal', icon: Minus, ring: 'ring-yellow-200' } :
                    { color: 'bg-warmgray', text: 'text-white', label: 'Regular', icon: Minus, ring: 'ring-gray-200' };

    const Icon = config.icon;

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1 ${config.color} ${config.text} text-xs font-bold px-2 py-0.5 rounded-lg`}>
                <Icon className="w-3 h-3" /> {score}
            </span>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${config.color} ${config.text} px-3 py-2 rounded-xl ring-2 ${config.ring}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <div>
                <p className="text-xs font-bold leading-none">{score}/100</p>
                <p className="text-xs opacity-75 leading-none">{config.label}</p>
            </div>
        </div>
    );
}
