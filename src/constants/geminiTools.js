export const GEMINI_TOOLS = [{
  functionDeclarations: [
    {
      name: "add_expense",
      description: "Add one or more expenses from natural language.",
      parameters: {
        type: "OBJECT",
        properties: {
          expenses: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                amount:      { type: "NUMBER" },
                category:    { type: "STRING", description: "food|transport|bills|shopping|health|entertain|other" },
                description: { type: "STRING" },
                merchant:    { type: "STRING" },
                date:        { type: "STRING", description: "YYYY-MM-DD" },
                method:      { type: "STRING", description: "Card|UPI|Cash|Net Banking|Transfer|Wallet" },
              },
              required: ["amount", "category"],
            },
          },
        },
        required: ["expenses"],
      },
    },
    {
      name: "query_expenses",
      description: "Query, filter, summarize expenses.",
      parameters: {
        type: "OBJECT",
        properties: {
          category:   { type: "STRING" },
          date_from:  { type: "STRING" },
          date_to:    { type: "STRING" },
          limit:      { type: "NUMBER" },
          sort_by:    { type: "STRING", description: "amount|date" },
          sort_order: { type: "STRING", description: "asc|desc" },
        },
      },
    },
    {
      name: "update_expense",
      description: "Update an existing expense.",
      parameters: {
        type: "OBJECT",
        properties: {
          id:          { type: "NUMBER" },
          last_n:      { type: "NUMBER", description: "1 = most recent" },
          amount:      { type: "NUMBER" },
          category:    { type: "STRING" },
          description: { type: "STRING" },
          merchant:    { type: "STRING" },
          method:      { type: "STRING" },
        },
      },
    },
    {
      name: "delete_expense",
      description: "Delete one or more expenses.",
      parameters: {
        type: "OBJECT",
        properties: {
          id:        { type: "NUMBER" },
          last_n:    { type: "NUMBER" },
          category:  { type: "STRING" },
          date_from: { type: "STRING" },
          date_to:   { type: "STRING" },
        },
      },
    },
    {
      name: "get_budget_status",
      description: "Check budget limits and spending.",
      parameters: {
        type: "OBJECT",
        properties: { category: { type: "STRING" } },
      },
    },
    {
      name: "get_insights",
      description: "Generate spending insights and recommendations.",
      parameters: {
        type: "OBJECT",
        properties: {
          period: { type: "STRING", description: "this_month|last_month|this_week|all" },
        },
      },
    },
  ],
}];
