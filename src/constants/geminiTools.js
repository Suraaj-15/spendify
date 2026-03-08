export const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "add_expense",
        description: "Add one or many expenses parsed from user natural language.",
        parameters: {
          type: "OBJECT",
          properties: {
            expenses: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  amount: { type: "NUMBER" },
                  currency: { type: "STRING", description: "ISO currency, e.g. INR, USD, EUR" },
                  category: { type: "STRING", description: "category id if known" },
                  description: { type: "STRING" },
                  merchant: { type: "STRING" },
                  date: { type: "STRING", description: "YYYY-MM-DD" },
                  method: { type: "STRING", description: "Card|UPI|Cash|Net Banking|Transfer|Wallet" },
                },
                required: ["amount"],
              },
            },
          },
          required: ["expenses"],
        },
      },
      {
        name: "query_expenses",
        description: "Read and summarize expenses with filters.",
        parameters: {
          type: "OBJECT",
          properties: {
            category: { type: "STRING" },
            date_from: { type: "STRING" },
            date_to: { type: "STRING" },
            merchant_contains: { type: "STRING" },
            limit: { type: "NUMBER" },
            sort_by: { type: "STRING", description: "amount|date" },
            sort_order: { type: "STRING", description: "asc|desc" },
          },
        },
      },
      {
        name: "update_expense",
        description: "Update an existing expense by id or recent context.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: { type: "NUMBER" },
            last_n: { type: "NUMBER", description: "1 means most recent expense" },
            amount: { type: "NUMBER" },
            currency: { type: "STRING" },
            category: { type: "STRING" },
            description: { type: "STRING" },
            merchant: { type: "STRING" },
            method: { type: "STRING" },
            date: { type: "STRING" },
          },
        },
      },
      {
        name: "delete_expense",
        description: "Delete expense(s). Bulk delete requires explicit confirmation step.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: { type: "NUMBER" },
            last_n: { type: "NUMBER" },
            category: { type: "STRING" },
            date_from: { type: "STRING" },
            date_to: { type: "STRING" },
            merchant_contains: { type: "STRING" },
            confirm: { type: "BOOLEAN" },
          },
        },
      },
      {
        name: "confirm_action",
        description: "Confirm or cancel the pending destructive action in chat context.",
        parameters: {
          type: "OBJECT",
          properties: {
            approve: { type: "BOOLEAN" },
          },
          required: ["approve"],
        },
      },
      {
        name: "compare_spending",
        description: "Compare two months and return totals plus category deltas.",
        parameters: {
          type: "OBJECT",
          properties: {
            current_month: { type: "STRING", description: "YYYY-MM" },
            previous_month: { type: "STRING", description: "YYYY-MM" },
          },
        },
      },
      {
        name: "get_budget_status",
        description: "Return budget consumption for a month/category.",
        parameters: {
          type: "OBJECT",
          properties: {
            month: { type: "STRING", description: "YYYY-MM" },
            category: { type: "STRING" },
          },
        },
      },
      {
        name: "get_insights",
        description: "Generate spending insights and recommendations from user data.",
        parameters: {
          type: "OBJECT",
          properties: {
            period: { type: "STRING", description: "this_month|last_month|this_week|all" },
          },
        },
      },
    ],
  },
];

