export interface Recipe {
    id:           number;
    name:         string;
    category:     string;
    description:  string;
    servings:     number;
    prepMins:     number;
    cookMins:     number;
    difficulty:   'easy' | 'medium' | 'hard';
    imageUrl:     string | null;
    createdAt:    string;
    updatedAt:    string;
}

export interface Ingredient {
    id:         number;
    recipeId:   number;
    name:       string;
    quantity:   string;
    unit:       string;
    notes:      string | null;
}

export interface Step {
    id:          number;
    recipeId:    number;
    stepNumber:  number;
    instruction: string;
}

export interface RecipeFull extends Recipe {
    ingredients: Ingredient[];
    steps:       Step[];
}

export interface PaginatedResult<T> {
    data:       T[];
    page:       number;
    pageSize:   number;
    total:      number;
    totalPages: number;
}

export interface ApiError {
    error:   string;
    details?: unknown;
}