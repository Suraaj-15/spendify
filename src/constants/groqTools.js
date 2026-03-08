export const GROQ_TOOLS = [
  {
    type: "function",
    function: {
      name: "add_expense",
      description: "Add one or many expenses parsed from user natural language.",
      parameters: {
        type: "object",
        properties: {
          expenses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                amount: { type: "number" },
                currency: { type: "string", description: "ISO currency, e.g. INR, USD, EUR" },
                category: { type: "string", description: "category id if known" },
                description: { type: "string" },
                merchant: { type: "string" },
                date: { type: "string", description: "YYYY-MM-DD" },
                method: { type: "string", description: "Card|UPI|Cash|Net Banking|Transfer|Wallet" },
              },
              required: ["amount"],
            },
          },
        },
        required: ["expenses"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_expenses",
      description: "Read and summarize expenses with filters.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string" },
          date_from: { type: "string" },
          date_to: { type: "string" },
          merchant_contains: { type: "string" },
          limit: { type: "number" },
          sort_by: { type: "string", description: "amount|date" },
          sort_order: { type: "string", description: "asc|desc" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_expense",
      description: "Update an existing expense by id or recent context.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number" },
          last_n: { type: "number", description: "1 means most recent expense" },
          amount: { type: "number" },
          currency: { type: "string" },
          category: { type: "string" },
          description: { type: "string" },
          merchant: { type: "string" },
          method: { type: "string" },
          date: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_expense",
      description: "Delete expense(s). Bulk delete requires explicit confirmation step.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "number" },
          last_n: { type: "number" },
          category: { type: "string" },
          date_from: { type: "string" },
          date_to: { type: "string" },
          merchant_contains: { type: "string" },
          confirm: { type: "boolean" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "confirm_action",
      description: "Confirm or cancel the pending destructive action in chat context.",
      parameters: {
        type: "object",
        properties: {
          approve: { type: "boolean" },
        },
        required: ["approve"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_spending",
      description: "Compare two months and return totals plus category deltas.",
      parameters: {
        type: "object",
        properties: {
          current_month: { type: "string", description: "YYYY-MM" },
          previous_month: { type: "string", description: "YYYY-MM" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_budget_status",
      description: "Return budget consumption for a month/category.",
      parameters: {
        type: "object",
        properties: {
          month: { type: "string", description: "YYYY-MM" },
          category: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_insights",
      description: "Generate spending insights and recommendations from user data.",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", description: "this_month|last_month|this_week|all" },
        },
      },
    },
  },
];

