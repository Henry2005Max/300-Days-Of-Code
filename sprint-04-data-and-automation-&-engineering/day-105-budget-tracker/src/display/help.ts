export function printHelp(): void {
    console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║          BUDGET TRACKER — Day 105                    ║
  ╚══════════════════════════════════════════════════════╝

  COMMANDS

  add <income|expense> <amount> <category> [desc] [date]
    Add a transaction.
    Example: budget add expense 45000 Food "Shoprite" 2025-01-10
    Example: budget add income 350000 Salary "January pay"

  list [--type=income|expense] [--month=YYYY-MM] [--category=X] [--limit=N]
    List transactions with optional filters.
    Example: budget list --month=2025-01 --type=expense
    Example: budget list --category=Food --limit=10

  summary [YYYY-MM]
    Monthly summary with category breakdown, budget bars, and running balance.
    Example: budget summary
    Example: budget summary 2025-01

  budget <category> <amount> [YYYY-MM]
    Set a spending budget limit for a category.
    Example: budget budget Food 65000
    Example: budget budget Transport 35000 2025-01

  delete <id>
    Delete a transaction by ID (shown in list).
    Example: budget delete 12

  export [filename]
    Export all transactions to CSV in ./data/exports/.
    Example: budget export
    Example: budget export january-2025

  seed
    Load sample Nigerian household budget data (2 months).

  help
    Show this help message.
`);
}