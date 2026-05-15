import { ScrapeTarget } from '../types';

export const SCRAPE_TARGETS: ScrapeTarget[] = [
    {
        name:            'Punch Nigeria',
        baseUrl:         'https://punchng.com',
        articleSelector: 'article.post',
        titleSelector:   'h2.post-title a, h3.post-title a',
        summarySelector: 'p.post-excerpt, .entry-content p',
        linkSelector:    'h2.post-title a, h3.post-title a',
        category:        'General News',
    },
    {
        name:            'Vanguard Nigeria',
        baseUrl:         'https://www.vanguardngr.com',
        articleSelector: 'article.post',
        titleSelector:   'h2 a',
        summarySelector: '.entry-summary p, .entry-content p',
        linkSelector:    'h2 a',
        category:        'General News',
    },
    {
        name:            'TechCabal',
        baseUrl:         'https://techcabal.com',
        articleSelector: 'article, .post-item',
        titleSelector:   'h2 a, h3 a, .post-title a',
        summarySelector: '.post-excerpt p, .entry-summary p',
        linkSelector:    'h2 a, h3 a, .post-title a',
        category:        'Technology',
    },
    {
        name:            'Nairametrics',
        baseUrl:         'https://nairametrics.com',
        articleSelector: 'article.post',
        titleSelector:   'h2.entry-title a',
        summarySelector: '.entry-summary p',
        linkSelector:    'h2.entry-title a',
        category:        'Business & Finance',
    },
];