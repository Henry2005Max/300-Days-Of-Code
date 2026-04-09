/* ── What are types/interfaces for? ─────────────────────────────────
   TypeScript's job is to know the shape of every piece of data.
   We define our data shapes here in one place and import them
   everywhere — routes, data files, helpers.
   If the shape changes, you update it here and TypeScript tells you
   everywhere else that needs to change too.
────────────────────────────────────────────────────────────────────── */

export interface City {
  id: number;
  name: string;
  state: string;
  region: string;         /* North, South-West, South-East, South-South etc */
  population: number;     /* approximate */
  isCapital: boolean;     /* state capital? */
  knownFor: string;       /* one-liner */
}

/* ── API response wrapper ────────────────────────────────────────────
   Every response from this API uses one of these two shapes.
   Success: { success: true,  data: T }
   Error:   { success: false, error: string }

   The generic <T> means the data field can be any type.
   ApiResponse<City>        → data is a single City
   ApiResponse<City[]>      → data is an array of Cities
   ApiResponse<{ total }>   → data is a stats object
────────────────────────────────────────────────────────────────────── */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    count: number;
    page?: number;
  };
}