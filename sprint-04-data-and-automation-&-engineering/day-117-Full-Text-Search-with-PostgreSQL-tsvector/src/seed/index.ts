import { getPool } from '../db/pool';
import { runMigrations } from '../db/migrations';

interface SeedArticle {
  title: string;
  body: string;
  author: string;
  category: string;
  tags: string[];
}

const ARTICLES: SeedArticle[] = [
  // Technology
  {
    title: 'How Lagos Startups Are Leveraging AI to Solve Local Problems',
    body: 'A wave of artificial intelligence startups in Lagos is tackling uniquely Nigerian challenges. From Babatunde Olatunji\'s traffic prediction model that has reduced commute times on the Lagos-Ibadan expressway by 18%, to Amaka Obi\'s crop disease detection tool used by smallholder farmers in Ogun State, AI is finding practical applications far beyond Silicon Valley\'s typical playbook. These founders are building on a foundation of local datasets, Yoruba and Igbo language models, and a deep understanding of infrastructure constraints like intermittent power and expensive mobile data. The result is a generation of tools that are robust to low-bandwidth environments and still deliver measurable value to everyday Nigerians.',
    author: 'Chidi Nwosu',
    category: 'Technology',
    tags: ['AI', 'Lagos', 'startups', 'machine-learning'],
  },
  {
    title: 'Fintech in Nigeria: The Rise of Agent Banking Across the North',
    body: 'Agent banking has quietly become the dominant financial access point for millions of Nigerians in Kano, Kaduna, and Sokoto. Operators like Musa Abdullahi, who runs a mobile money kiosk near Kano central market, process hundreds of transactions daily — salary withdrawals, utility bill payments, and interbank transfers — for customers who have never set foot in a traditional bank. The Central Bank of Nigeria\'s tiered KYC framework has been instrumental in enabling this expansion, allowing basic accounts to be opened with a National Identification Number and a BVN. Analysts say agent banking volume grew 47% in 2024 across the North West geopolitical zone, driven by a combination of new entrants like Moniepoint and OPay and rising smartphone penetration.',
    author: 'Fatima Al-Hassan',
    category: 'Fintech',
    tags: ['agent-banking', 'financial-inclusion', 'Kano', 'mobile-money'],
  },
  {
    title: 'Building Offline-First Mobile Apps for Nigerian Users',
    body: 'Designing mobile applications for Nigerian users means accepting one uncomfortable truth early: the network will fail you. Intermittent connectivity, expensive data, and frequent power outages that drain device batteries mid-session make offline-first architecture not a luxury but a necessity. Experienced React Native developers in the Lagos and Abuja tech communities have converged on a stack: WatermelonDB for local relational storage, a sync engine using delta updates rather than full data dumps, and aggressive use of background tasks via react-native-background-fetch to sync when connectivity returns. The UI layer needs to communicate sync state clearly — a subtle indicator showing "Saved locally, syncing..." builds more trust than an opaque loading spinner that may spin forever on a 2G connection.',
    author: 'Henry Ehindero',
    category: 'Technology',
    tags: ['React-Native', 'offline-first', 'mobile', 'Nigeria'],
  },
  {
    title: 'Paystack vs Flutterwave: Which Gateway Suits Your Nigerian Business?',
    body: 'Choosing a payment gateway in Nigeria is more nuanced than comparing transaction fees alone. Paystack, acquired by Stripe in 2020, is often the first choice for developer-led teams thanks to its clean API documentation, reliable webhook delivery, and Stripe-backed infrastructure. Flutterwave\'s advantage lies in its breadth: payment links, POS hardware, multi-currency settlement in USD or GBP, and a wider presence across African markets, making it the go-to for businesses with pan-African ambitions. For a Lagos-based e-commerce startup serving primarily Nigerian customers, Paystack\'s 1.5% domestic card fee plus ₦2,000 monthly fee is often cheaper at moderate volumes. Once you scale beyond ₦50 million monthly turnover or need to collect payments in Ghana and Kenya simultaneously, Flutterwave\'s comprehensive dashboard becomes harder to ignore.',
    author: 'Akinwale Bello',
    category: 'Fintech',
    tags: ['Paystack', 'Flutterwave', 'payments', 'e-commerce'],
  },
  {
    title: 'Porting Your Django App to FastAPI: A Nigerian Developer\'s Journey',
    body: 'Adaeze Onyekwere spent three months porting the backend of a Abuja-based health records platform from Django REST Framework to FastAPI, and the performance results were striking. Median API response times dropped from 420ms to 85ms on the same DigitalOcean droplet, with no changes to the PostgreSQL schema. FastAPI\'s async-first design means database calls no longer block threads, which matters enormously when dozens of clinic staff are simultaneously querying patient records. The migration was not painless — Django\'s admin panel, ORM magic, and decade of battle-tested middleware had to be replaced with Pydantic models and SQLAlchemy Core. Adaeze\'s advice for teams considering the switch: migrate one endpoint at a time behind a feature flag, keep your test coverage above 80%, and do not underestimate how much you relied on Django signals.',
    author: 'Adaeze Onyekwere',
    category: 'Technology',
    tags: ['FastAPI', 'Django', 'Python', 'backend', 'performance'],
  },
  {
    title: 'The FCCPC and Nigeria\'s Emerging Data Protection Landscape',
    body: 'The Federal Competition and Consumer Protection Commission has been stepping up enforcement of the Nigeria Data Protection Act 2023, issuing compliance notices to several e-commerce platforms and financial services companies that were found to be processing personal data without adequate consent mechanisms. Data Protection Officers are now mandatory for organisations processing the personal data of more than 1,000 Nigerians annually. The penalties under NDPA are steep — up to 2% of annual global gross revenue or ₦10 million, whichever is higher. Legal experts like Tolu Adegoke of Templars Law are urging startups to conduct data protection impact assessments before launching new features that involve biometric data collection or third-party data sharing agreements.',
    author: 'Tolu Adegoke',
    category: 'Legal & Regulation',
    tags: ['NDPA', 'data-protection', 'FCCPC', 'compliance', 'privacy'],
  },
  {
    title: 'Solar Energy and the Nigerian SME: A Practical Cost Analysis',
    body: 'For the average small business in Port Harcourt or Enugu running on diesel generators at ₦1,200 per litre, the economics of solar energy have shifted decisively in the past two years. A properly sized 5kVA solar system with lithium iron phosphate batteries now costs between ₦3.5 million and ₦4.2 million installed, with a realistic payback period of 28 to 36 months at current diesel prices. Ifeanyi Okafor, who owns a printing business in Enugu, made the switch in 2023 and calculates he saves roughly ₦180,000 monthly on generator fuel. The key variables are battery sizing (undersizing kills ROI when the grid is down for 18 hours), inverter quality, and whether your load is resistive or includes high-inrush motors like air conditioners.',
    author: 'Ifeanyi Okafor',
    category: 'Business',
    tags: ['solar', 'energy', 'SME', 'cost-analysis', 'Enugu'],
  },
  {
    title: 'Understanding tsvector and Full-Text Search in PostgreSQL',
    body: 'PostgreSQL\'s full-text search system is built around two data types: tsvector and tsquery. A tsvector is a sorted list of lexemes — normalised, stemmed word roots — extracted from a document, with optional positional information and weights. A tsquery is a structured boolean expression of lexemes with AND (&), OR (|), and NOT (!) operators. The @@ operator checks whether a tsquery matches a tsvector. In practice, you store a pre-computed tsvector column populated by a trigger and index it with a GIN index. GIN indexes are optimised for elements that can appear in multiple rows — exactly the case for lexemes. ts_rank and ts_rank_cd score a document against a query: ts_rank_cd uses cover density, rewarding documents where matched terms cluster together. ts_headline extracts a snippet of the original text with matched terms highlighted, ideal for search result previews.',
    author: 'Chidi Nwosu',
    category: 'Technology',
    tags: ['PostgreSQL', 'full-text-search', 'tsvector', 'database'],
  },
  {
    title: 'Logistics in Nigeria: Last-Mile Delivery Challenges and Startup Solutions',
    body: 'Last-mile delivery in Nigeria is a fundamentally different problem from what logistics companies face in Europe or North America. Addresses are non-standardised — "third house after the yellow transformer, Opebi, Lagos" is a real delivery instruction. Roads flood seasonally. Traffic in Lagos means a 4km delivery can take 90 minutes. Startups like Topship, Kwik, and GIG Logistics are attacking this with a combination of what3words integration for precise location encoding, motorcycle dispatch fleets that bypass gridlock, and hub-and-spoke models using neighbourhood agents as pick-up points. The agent network model mirrors the success of agent banking: instead of trying to reach every doorstep, meet customers where they already go.',
    author: 'Ngozi Eze',
    category: 'Business',
    tags: ['logistics', 'last-mile', 'delivery', 'Lagos', 'startups'],
  },
  {
    title: 'React Native Performance Optimisation for Low-End Android Devices',
    body: 'A significant portion of Nigerian mobile users run Android devices with 2GB of RAM or less — handsets like the Tecno Spark or Itel A series. Building a React Native app that performs well on these devices requires deliberate choices at every layer of the stack. FlatList\'s windowSize and maxToRenderPerBatch props should be tuned down from their defaults: a windowSize of 5 (instead of 21) and maxToRenderPerBatch of 5 reduces memory pressure noticeably. Use React.memo aggressively on list item components to avoid re-renders. Avoid anonymous function props in JSX — they create new function references on every render. Hermes, React Native\'s optimised JavaScript engine, is enabled by default since 0.70 and provides a meaningful boot time improvement on low-end hardware. Profile with the Flipper performance plugin before and after optimisations to verify real gains.',
    author: 'Henry Ehindero',
    category: 'Technology',
    tags: ['React-Native', 'performance', 'Android', 'mobile', 'Hermes'],
  },
  {
    title: 'Agricultural Finance in Nigeria: The Gap Smallholder Farmers Face',
    body: 'Nigeria has approximately 36 million smallholder farming households, yet less than 5% have ever accessed formal agricultural credit. The barriers are well-documented: lack of title documents for land used under customary tenure, absence of formal income records, and the high cost of credit risk assessment at small ticket sizes. Agri-fintech companies like Thrive Agric and Farmcrowdy pioneered farmer aggregation as a solution — pooling many small farmers under a single credit facility managed by a cooperative or aggregator. The model works when off-take agreements are in place (a large buyer commits to purchase the harvest), which gives lenders collateral equivalent. Where it breaks down is in seasons of commodity price collapse or flood damage, which can wipe out an entire loan book.',
    author: 'Fatima Al-Hassan',
    category: 'Agriculture',
    tags: ['agriculture', 'finance', 'smallholder', 'credit', 'agri-fintech'],
  },
  {
    title: 'PostgreSQL Window Functions for Analytics: A Deep Dive',
    body: 'Window functions in PostgreSQL allow you to compute aggregate values across a sliding frame of rows without collapsing the result set the way GROUP BY does. The OVER clause defines the window: PARTITION BY divides rows into groups, ORDER BY sequences them within each partition, and ROWS/RANGE clauses define the frame. Common use cases include running totals (SUM(amount) OVER (PARTITION BY user_id ORDER BY date)), ranking within a group (RANK() OVER (PARTITION BY category ORDER BY sales DESC)), and moving averages (AVG(price) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)). The key insight is that window functions execute after WHERE, GROUP BY, and HAVING but before the final ORDER BY and LIMIT, which means you can filter on window function results only by wrapping the query in a subquery or CTE.',
    author: 'Chidi Nwosu',
    category: 'Technology',
    tags: ['PostgreSQL', 'window-functions', 'analytics', 'database', 'SQL'],
  },
  {
    title: 'Navigating Naira Volatility as a Nigerian Freelancer',
    body: 'Nigerian freelancers earning in USD or EUR have had to become part-time currency traders over the past three years. The official NAFEM rate and the parallel market rate have diverged and converged multiple times, creating opportunities and headaches in roughly equal measure. The safest strategy most experienced freelancers converge on: invoice in USD, receive in a foreign-currency domiciliary account or a Wise/Grey account, and convert to Naira only at the moment of actual need. Holding Naira balances beyond a month\'s operating expenses has historically been a losing trade during periods of high inflation. For taxes, the FIRS currently taxes foreign-sourced income at the official exchange rate at time of receipt — keeping clear FX conversion records is essential for accurate tax filings.',
    author: 'Akinwale Bello',
    category: 'Business',
    tags: ['freelancing', 'Naira', 'foreign-exchange', 'USD', 'taxation'],
  },
  {
    title: 'Building a RAG Chatbot for Nigerian University Students',
    body: 'Retrieval-Augmented Generation is proving particularly useful in educational contexts where the knowledge base is narrow but dense. A team at Covenant University built a RAG chatbot covering course outlines, departmental regulations, hostel rules, and fee schedules — roughly 400 PDF pages of institutional documents. The architecture: documents were chunked at 512 tokens with 64-token overlaps, embedded using a multilingual sentence transformer, stored in a pgvector table in PostgreSQL, and retrieved using cosine similarity at query time before being passed to Claude as context. Response quality improved dramatically over a base LLM because the model stopped hallucinating policy details and instead cited exact clauses from the actual university handbook. The biggest engineering challenge was chunking across table-heavy PDF pages where content was split across cell boundaries.',
    author: 'Adaeze Onyekwere',
    category: 'Technology',
    tags: ['RAG', 'chatbot', 'university', 'pgvector', 'LLM', 'education'],
  },
  {
    title: 'E-commerce in Nigeria: Why Logistics Beats Marketing Every Time',
    body: 'Every experienced Nigerian e-commerce operator will tell you the same thing: the moment a customer\'s package is delayed, damaged, or marked delivered but never received, you lose that customer permanently and gain a negative review. Marketing can drive a customer to your store once; logistics determines if they come back. The best-performing Nigerian online shops invest disproportionately in last-mile quality: white-glove packaging, same-day confirmation calls after dispatch, proactive SMS updates with rider names and phone numbers, and a no-questions-asked 48-hour return window. The operational cost of this is offset by repeat purchase rates that are 3x higher than competitors who compete primarily on price. In a market where trust is scarce and reputation travels fast through WhatsApp groups, reliability is the only durable moat.',
    author: 'Ngozi Eze',
    category: 'Business',
    tags: ['e-commerce', 'logistics', 'Nigeria', 'customer-retention', 'marketing'],
  },
];

export async function seedArticles(): Promise<void> {
  await runMigrations();
  const pool = getPool();

  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM articles');
  if (existing.rows[0].count > 0) {
    console.log(`Database already has ${existing.rows[0].count} articles — skipping seed.`);
    return;
  }

  const insert = `
    INSERT INTO articles (title, body, author, category, tags)
    VALUES ($1, $2, $3, $4, $5)
  `;

  for (const article of ARTICLES) {
    await pool.query(insert, [
      article.title,
      article.body,
      article.author,
      article.category,
      article.tags,
    ]);
  }

  console.log(`Seeded ${ARTICLES.length} articles across ${new Set(ARTICLES.map((a) => a.category)).size} categories.`);
}

if (require.main === module) {
  seedArticles()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
