import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "GOLDPAY",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [{ title: "Overview", url: "/" }],
      },
      {
        title: "Documentation",
        icon: Icons.DocIcon,
        items: [{ title: "API reference", url: "/docs" }],
      },
      {
        title: "Transactions",
        icon: Icons.Table,
        items: [
          { title: "Transactions", url: "/transactions" },
          { title: "Create Deposit", url: "/transactions/payin" },
          { title: "Create Withdrawal", url: "/transactions/payout" },
        ],
      },
      {
        title: "History",
        icon: Icons.Calendar,
        items: [{ title: "Transaction History", url: "/history" }],
      },
      {
        title: "Settings",
        icon: Icons.Alphabet,
        items: [{ title: "Settings", url: "/pages/settings" }],
      },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      {
        title: "Authentication",
        icon: Icons.Authentication,
        items: [{ title: "Sign In", url: "/auth/sign-in" }],
      },
    ],
  },
];
