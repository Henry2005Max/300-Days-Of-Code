export type JobStatus = 'success' | 'failed' | 'running';

export interface JobDefinition {
    id:          string;
    name:        string;
    schedule:    string;   // cron expression
    description: string;
    handler:     () => Promise<JobOutput>;
}

export interface JobOutput {
    message: string;
    data?:   Record<string, unknown>;
}

export interface JobRun {
    id:         number;
    jobId:      string;
    jobName:    string;
    status:     JobStatus;
    startedAt:  string;
    finishedAt: string | null;
    durationMs: number | null;
    message:    string;
}

export interface JobStats {
    jobId:       string;
    jobName:     string;
    schedule:    string;
    description: string;
    totalRuns:   number;
    successRuns: number;
    failedRuns:  number;
    lastStatus:  JobStatus | null;
    lastRun:     string | null;
    lastMessage: string | null;
    avgDurationMs: number | null;
    streak:      number;   // consecutive successes
}