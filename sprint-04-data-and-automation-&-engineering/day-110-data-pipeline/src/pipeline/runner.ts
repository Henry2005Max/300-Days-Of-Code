import fs                     from 'fs';
import path                  from 'path';
import { pipeline }          from 'stream/promises';
import { parse }             from 'csv-parse';
import { stringify }         from 'csv-stringify';
import { ValidateStage }     from '../stages/validateStage';
import { EnrichStage }       from '../stages/enrichStage';
import { AggregateStage }    from '../stages/aggregateStage';
import { PipelineSummary }   from '../types';

export async function runPipeline(config: {
    inputFile:    string;
    outputCsv:    string;
    outputJson:   string;
    skipInvalid:  boolean;
    logEvery:     number;
}): Promise<PipelineSummary> {
    const startedAt = new Date().toISOString();
    const startMs   = Date.now();

    // Ensure output directories exist
    fs.mkdirSync(path.dirname(config.outputCsv),  { recursive: true });
    fs.mkdirSync(path.dirname(config.outputJson), { recursive: true });

    // Build stages
    const validator  = new ValidateStage(config.skipInvalid, config.logEvery);
    const enricher   = new EnrichStage();
    const aggregator = new AggregateStage();

    // CSV output columns (enriched schema)
    const csvColumns = [
        'order_id', 'customer_name', 'product', 'category',
        'quantity', 'unit_price', 'total_amount',
        'city', 'state', 'order_date',
        'month', 'quarter', 'revenue_band', 'discount_pct', 'day_of_week',
    ];

    // Wire the pipeline:
    // ReadStream → csv-parse → Validate → Enrich → Aggregate → csv-stringify → WriteStream
    await pipeline(
        fs.createReadStream(config.inputFile),
        parse({ columns: true, skip_empty_lines: true, trim: true, cast: false }),
        validator,
        enricher,
        aggregator,
        stringify({ header: true, columns: csvColumns }),
        fs.createWriteStream(config.outputCsv)
    );

    console.log(''); // clear the \r progress line

    const finishedAt  = new Date().toISOString();
    const durationMs  = Date.now() - startMs;

    const summary: PipelineSummary = {
        inputFile:     config.inputFile,
        startedAt,
        finishedAt,
        durationMs,
        totalRows:     validator.stats.in,
        validRows:     validator.stats.out,
        invalidRows:   validator.stats.dropped,
        enrichedRows:  enricher.stats.out,
        categories:    aggregator.getCategories(),
        monthlyTotals: aggregator.getMonthlyTotals(),
        topCities:     aggregator.getTopCities(10),
    };

    // Write JSON summary
    fs.writeFileSync(config.outputJson, JSON.stringify(summary, null, 2), 'utf-8');

    return summary;
}