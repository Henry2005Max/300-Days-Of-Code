import { JobDefinition } from '../types';
import {
    heartbeatJob,
    logRotationJob,
    reportSnapshotJob,
    staleCleanupJob,
    healthCheckJob,
} from './handlers';

export const JOB_REGISTRY: JobDefinition[] = [
    {
        id:          'heartbeat',
        name:        'Heartbeat Ping',
        schedule:    '*/15 * * * * *',   // every 15 seconds
        description: 'Logs memory usage and uptime to confirm the process is alive.',
        handler:     heartbeatJob,
    },
    {
        id:          'health-check',
        name:        'Health Check',
        schedule:    '*/30 * * * * *',   // every 30 seconds
        description: 'Verifies that required directories and the DB file exist.',
        handler:     healthCheckJob,
    },
    {
        id:          'report-snapshot',
        name:        'Report Snapshot',
        schedule:    '0 */1 * * * *',    // every 1 minute at :00
        description: 'Writes a JSON process snapshot to ./logs/snapshots/.',
        handler:     reportSnapshotJob,
    },
    {
        id:          'stale-cleanup',
        name:        'Stale Log Cleanup',
        schedule:    '30 */2 * * * *',   // every 2 minutes at :30
        description: 'Removes rotated log files older than 1 minute (demo threshold).',
        handler:     staleCleanupJob,
    },
    {
        id:          'log-rotation',
        name:        'Log Rotation',
        schedule:    '0 */3 * * * *',    // every 3 minutes at :00
        description: 'Rotates the scheduler log if it exceeds 50KB.',
        handler:     logRotationJob,
    },
];