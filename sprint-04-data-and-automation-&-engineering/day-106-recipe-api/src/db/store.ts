import Database from 'better-sqlite3';
import fs       from 'fs';
import path     from 'path';
import dotenv   from 'dotenv';
dotenv.config();

let db: Database.Database | null = null;

function buildStatements(d: Database.Database) {
    return {
        // Recipes
        insertRecipe: d.prepare(`
      INSERT INTO recipes (name, category, description, servings, prep_mins, cook_mins, difficulty, image_url)
      VALUES (@name, @category, @description, @servings, @prepMins, @cookMins, @difficulty, @imageUrl)
    `),
        updateRecipe: d.prepare(`
      UPDATE recipes SET
        name = @name, category = @category, description = @description,
        servings = @servings, prep_mins = @prepMins, cook_mins = @cookMins,
        difficulty = @difficulty, image_url = @imageUrl,
        updated_at = datetime('now')
      WHERE id = @id
    `),
        deleteRecipe:    d.prepare(`DELETE FROM recipes WHERE id = @id`),
        getRecipeById:   d.prepare(`SELECT * FROM recipes WHERE id = @id`),
        countRecipes:    d.prepare(`
      SELECT COUNT(*) AS count FROM recipes
      WHERE (@q IS NULL OR name LIKE @qLike OR description LIKE @qLike OR category LIKE @qLike)
        AND (@category   IS NULL OR category   = @category)
        AND (@difficulty IS NULL OR difficulty = @difficulty)
        AND (@ingredient IS NULL OR id IN (
          SELECT recipe_id FROM ingredients WHERE name LIKE @ingredientLike
        ))
    `),
        listRecipes: d.prepare(`
      SELECT * FROM recipes
      WHERE (@q IS NULL OR name LIKE @qLike OR description LIKE @qLike OR category LIKE @qLike)
        AND (@category   IS NULL OR category   = @category)
        AND (@difficulty IS NULL OR difficulty = @difficulty)
        AND (@ingredient IS NULL OR id IN (
          SELECT recipe_id FROM ingredients WHERE name LIKE @ingredientLike
        ))
      ORDER BY name ASC
      LIMIT @limit OFFSET @offset
    `),
        getCategories: d.prepare(`SELECT DISTINCT category FROM recipes ORDER BY category`),

        // Ingredients
        insertIngredient: d.prepare(`
      INSERT INTO ingredients (recipe_id, name, quantity, unit, notes)
      VALUES (@recipeId, @name, @quantity, @unit, @notes)
    `),
        deleteIngredientsByRecipe: d.prepare(`DELETE FROM ingredients WHERE recipe_id = @recipeId`),
        getIngredientsByRecipe:    d.prepare(`SELECT * FROM ingredients WHERE recipe_id = @recipeId ORDER BY id`),

        // Steps
        insertStep: d.prepare(`
      INSERT INTO steps (recipe_id, step_number, instruction)
      VALUES (@recipeId, @stepNumber, @instruction)
    `),
        deleteStepsByRecipe: d.prepare(`DELETE FROM steps WHERE recipe_id = @recipeId`),
        getStepsByRecipe:    d.prepare(`SELECT * FROM steps WHERE recipe_id = @recipeId ORDER BY step_number`),
    };
}

let stmts: ReturnType<typeof buildStatements> | null = null;

function initDb(): void {
    if (db) return;
    const dbPath = path.resolve(process.env.DB_PATH || './data/recipes.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      category    TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      servings    INTEGER NOT NULL DEFAULT 4,
      prep_mins   INTEGER NOT NULL DEFAULT 0,
      cook_mins   INTEGER NOT NULL DEFAULT 0,
      difficulty  TEXT    NOT NULL DEFAULT 'medium'
                  CHECK (difficulty IN ('easy','medium','hard')),
      image_url   TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_recipes_category   ON recipes (category);
    CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes (difficulty);
    CREATE INDEX IF NOT EXISTS idx_recipes_name       ON recipes (name);

    CREATE TABLE IF NOT EXISTS ingredients (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      name      TEXT    NOT NULL,
      quantity  TEXT    NOT NULL,
      unit      TEXT    NOT NULL DEFAULT '',
      notes     TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_ingredients_recipe ON ingredients (recipe_id);
    CREATE INDEX IF NOT EXISTS idx_ingredients_name   ON ingredients (name);

    CREATE TABLE IF NOT EXISTS steps (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id   INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      step_number INTEGER NOT NULL,
      instruction TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_steps_recipe ON steps (recipe_id);
  `);

    stmts = buildStatements(db);
}

function S(): ReturnType<typeof buildStatements> {
    if (!stmts) initDb();
    return stmts!;
}

function mapRecipe(r: Record<string, unknown>) {
    return {
        id:          r.id,
        name:        r.name,
        category:    r.category,
        description: r.description,
        servings:    r.servings,
        prepMins:    r.prep_mins,
        cookMins:    r.cook_mins,
        difficulty:  r.difficulty,
        imageUrl:    r.image_url,
        createdAt:   r.created_at,
        updatedAt:   r.updated_at,
    };
}

function mapIngredient(r: Record<string, unknown>) {
    return {
        id:       r.id,
        recipeId: r.recipe_id,
        name:     r.name,
        quantity: r.quantity,
        unit:     r.unit,
        notes:    r.notes,
    };
}

function mapStep(r: Record<string, unknown>) {
    return {
        id:          r.id,
        recipeId:    r.recipe_id,
        stepNumber:  r.step_number,
        instruction: r.instruction,
    };
}

// ── Recipe CRUD ───────────────────────────────────────────────────────────

export function createRecipe(data: {
    name: string; category: string; description: string;
    servings: number; prepMins: number; cookMins: number;
    difficulty: string; imageUrl: string | null | undefined;
    ingredients: { name: string; quantity: string; unit: string; notes?: string | null }[];
    steps: { stepNumber: number; instruction: string }[];
}) {
    initDb();
    const insert = db!.transaction(() => {
        const result = S().insertRecipe.run({
            name: data.name, category: data.category, description: data.description,
            servings: data.servings, prepMins: data.prepMins, cookMins: data.cookMins,
            difficulty: data.difficulty, imageUrl: data.imageUrl ?? null,
        });
        const recipeId = result.lastInsertRowid as number;

        for (const ing of data.ingredients) {
            S().insertIngredient.run({ recipeId, name: ing.name, quantity: ing.quantity, unit: ing.unit, notes: ing.notes ?? null });
        }
        for (const step of data.steps) {
            S().insertStep.run({ recipeId, stepNumber: step.stepNumber, instruction: step.instruction });
        }

        return recipeId;
    });
    return insert();
}

export function getRecipeById(id: number) {
    const recipe = S().getRecipeById.get({ id }) as Record<string, unknown> | undefined;
    if (!recipe) return null;

    const ingredients = (S().getIngredientsByRecipe.all({ recipeId: id }) as Record<string, unknown>[]).map(mapIngredient);
    const steps       = (S().getStepsByRecipe.all({ recipeId: id }) as Record<string, unknown>[]).map(mapStep);

    return { ...mapRecipe(recipe), ingredients, steps };
}

export function updateRecipe(id: number, data: {
    name?: string; category?: string; description?: string;
    servings?: number; prepMins?: number; cookMins?: number;
    difficulty?: string; imageUrl?: string | null;
    ingredients?: { name: string; quantity: string; unit: string; notes?: string | null }[];
    steps?: { stepNumber: number; instruction: string }[];
}) {
    initDb();
    const existing = getRecipeById(id);
    if (!existing) return null;

    const update = db!.transaction(() => {
        S().updateRecipe.run({
            id,
            name:        data.name        ?? existing.name,
            category:    data.category    ?? existing.category,
            description: data.description ?? existing.description,
            servings:    data.servings    ?? existing.servings,
            prepMins:    data.prepMins    ?? existing.prepMins,
            cookMins:    data.cookMins    ?? existing.cookMins,
            difficulty:  data.difficulty  ?? existing.difficulty,
            imageUrl:    data.imageUrl    !== undefined ? data.imageUrl : existing.imageUrl,
        });

        if (data.ingredients) {
            S().deleteIngredientsByRecipe.run({ recipeId: id });
            for (const ing of data.ingredients) {
                S().insertIngredient.run({ recipeId: id, name: ing.name, quantity: ing.quantity, unit: ing.unit, notes: ing.notes ?? null });
            }
        }
        if (data.steps) {
            S().deleteStepsByRecipe.run({ recipeId: id });
            for (const step of data.steps) {
                S().insertStep.run({ recipeId: id, stepNumber: step.stepNumber, instruction: step.instruction });
            }
        }
    });

    update();
    return getRecipeById(id);
}

export function deleteRecipe(id: number): boolean {
    const result = S().deleteRecipe.run({ id });
    return result.changes > 0;
}

export function listRecipes(opts: {
    page: number; pageSize: number; q?: string;
    category?: string; difficulty?: string; ingredient?: string;
}) {
    const q              = opts.q          ? opts.q          : null;
    const qLike          = q               ? `%${q}%`        : null;
    const category       = opts.category   ?? null;
    const difficulty     = opts.difficulty ?? null;
    const ingredient     = opts.ingredient ?? null;
    const ingredientLike = ingredient      ? `%${ingredient}%` : null;
    const offset         = (opts.page - 1) * opts.pageSize;

    const params = { q, qLike, category, difficulty, ingredient, ingredientLike };

    const { count } = S().countRecipes.get(params) as { count: number };
    const rows      = (S().listRecipes.all({ ...params, limit: opts.pageSize, offset }) as Record<string, unknown>[]).map(mapRecipe);

    return {
        data:       rows,
        page:       opts.page,
        pageSize:   opts.pageSize,
        total:      count,
        totalPages: Math.ceil(count / opts.pageSize),
    };
}

export function getCategories(): string[] {
    return (S().getCategories.all() as { category: string }[]).map((r) => r.category);
}

export function closeDb(): void {
    if (db) { db.close(); db = null; stmts = null; }
}