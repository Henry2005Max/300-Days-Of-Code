import nlp from 'compromise';
import { InputText, SentimentResult, SentimentLabel, Entity } from '../types';

// Positive and negative word lexicons tuned for Nigerian business/news context
const POSITIVE_WORDS = new Set([
    'good','great','excellent','outstanding','impressive','strong','surge','growth',
    'profit','gain','rise','increase','boost','improve','success','achieve','win',
    'record','high','best','positive','approve','launch','expand','invest','recover',
    'celebrate','award','breakthrough','efficient','innovative','robust','stable',
    'deliver','benefit','opportunity','affordable','accessible','empower','thrive',
]);

const NEGATIVE_WORDS = new Set([
    'bad','poor','weak','drop','fall','decline','loss','crash','crisis','fail',
    'concern','problem','issue','risk','threat','inflation','shortage','deficit',
    'corrupt','fraud','scam','attack','protest','strike','ban','sanction','debt',
    'recession','hardship','poverty','crime','violence','reject','delay','collapse',
    'unstable','insecurity','kidnap','flood','devalue','default','miss','suspend',
]);

const INTENSIFIERS = new Set(['very','extremely','highly','significantly','severely','deeply','massively']);
const NEGATORS     = new Set(['not','no','never','neither','nor','without','barely','hardly']);

function scoreSentiment(text: string): { score: number; magnitude: number } {
    const words     = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
    let   raw       = 0;
    let   magnitude = 0;
    let   multiplier = 1;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const prev = words[i - 1] || '';

        if (INTENSIFIERS.has(word)) { multiplier = 1.5; continue; }
        if (NEGATORS.has(word))     { multiplier = -1;  continue; }

        if (POSITIVE_WORDS.has(word)) {
            const isNegated = NEGATORS.has(prev);
            const val       = isNegated ? -1 * multiplier : 1 * multiplier;
            raw      += val;
            magnitude += Math.abs(val);
        } else if (NEGATIVE_WORDS.has(word)) {
            const isNegated = NEGATORS.has(prev);
            const val       = isNegated ? 1 * multiplier : -1 * multiplier;
            raw      += val;
            magnitude += Math.abs(val);
        }

        multiplier = 1;
    }

    const wordCount = words.length || 1;
    const score     = Math.max(-1, Math.min(1, raw / Math.sqrt(wordCount)));
    const mag       = Math.min(1, magnitude / Math.sqrt(wordCount));

    return {
        score:     parseFloat(score.toFixed(4)),
        magnitude: parseFloat(mag.toFixed(4)),
    };
}

function labelFromScore(score: number): SentimentLabel {
    if (score >  0.05) return 'positive';
    if (score < -0.05) return 'negative';
    return 'neutral';
}

function extractEntities(text: string): Entity[] {
    const doc      = nlp(text);
    const entities: Entity[] = [];
    const seen     = new Set<string>();

    const add = (items: string[], type: Entity['type']) => {
        for (const item of items) {
            const clean = item.trim();
            if (clean.length > 1 && !seen.has(clean.toLowerCase())) {
                seen.add(clean.toLowerCase());
                entities.push({ text: clean, type });
            }
        }
    };

    add(doc.people().out('array')        as string[], 'person');
    add(doc.places().out('array')        as string[], 'place');
    add(doc.organizations().out('array') as string[], 'organization');

    // Topics — nouns not already captured as named entities
    const nouns = (doc.nouns().out('array') as string[])
        .filter((n: string) => n.length > 3 && !seen.has(n.toLowerCase()));
    add(nouns.slice(0, 5), 'topic');

    return entities;
}

function extractKeywords(text: string): string[] {
    const doc = nlp(text);

    const terms: string[] = [
        ...(doc.nouns().out('array')   as string[]),
        ...(doc.verbs().out('array')   as string[]),
    ]
        .map((t: string) => t.toLowerCase().trim())
        .filter((t: string) => t.length > 3 && !/^\d+$/.test(t));

    // Deduplicate and return top 8
    return [...new Set(terms)].slice(0, 8);
}

export function analyzeText(input: InputText): SentimentResult {
    const { score, magnitude } = scoreSentiment(input.text);
    const label                = labelFromScore(score);
    const entities             = extractEntities(input.text);
    const keywords             = extractKeywords(input.text);
    const wordCount            = input.text.trim().split(/\s+/).length;

    return {
        inputId:    input.id,
        text:       input.text,
        source:     input.source,
        category:   input.category,
        label,
        score,
        magnitude,
        entities,
        keywords,
        wordCount,
        analyzedAt: new Date(),
    };
}