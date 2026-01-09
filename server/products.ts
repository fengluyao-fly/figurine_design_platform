/**
 * Stripe product and price definitions
 * Centralized configuration for all payment products
 */

export const PRODUCTS = {
  FIGURINE_DEPOSIT: {
    name: "Figurine Design Deposit",
    description: "Initial deposit for custom figurine design service. Our designers will refine your 3D model within 24 hours.",
    amount: 2000, // $20.00 in cents
    currency: "usd",
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
