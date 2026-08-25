import type { BillingCheckout } from "@/lib/types";

const PADDLE_SRC = "https://cdn.paddle.com/paddle/v2/paddle.js";

type PaddleEvent = { name?: string };

type PaddleSdk = {
  Environment: { set: (env: string) => void };
  Initialize: (opts: {
    token: string;
    eventCallback?: (event: PaddleEvent) => void;
  }) => void;
  Checkout: {
    open: (opts: {
      items: { priceId: string; quantity: number }[];
      customer: { email: string };
      customData: Record<string, string>;
    }) => void;
  };
};

declare global {
  interface Window {
    Paddle?: PaddleSdk;
  }
}

export type CheckoutEvent = "checkout.completed" | "checkout.closed";

let scriptPromise: Promise<PaddleSdk> | null = null;
let initialized = false;
// Paddle.Initialize can only run once per page, so the event listener is a
// swappable slot rather than a per-call argument.
let onCheckoutEvent: ((event: CheckoutEvent) => void) | null = null;

function loadScript(): Promise<PaddleSdk> {
  if (window.Paddle) return Promise.resolve(window.Paddle);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = PADDLE_SRC;
      script.async = true;
      script.onload = () =>
        window.Paddle
          ? resolve(window.Paddle)
          : reject(new Error("Paddle failed to load."));
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Couldn't load the checkout. Check your connection and try again."));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/** Load Paddle.js, initialize once, and open the checkout overlay. */
export async function openCheckout(
  config: BillingCheckout,
  priceId: string,
  onEvent: (event: CheckoutEvent) => void,
) {
  const paddle = await loadScript();
  onCheckoutEvent = onEvent;
  if (!initialized) {
    paddle.Environment.set(config.environment);
    paddle.Initialize({
      token: config.client_token,
      eventCallback: (event) => {
        if (event.name === "checkout.completed" || event.name === "checkout.closed") {
          onCheckoutEvent?.(event.name);
        }
      },
    });
    initialized = true;
  }
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: { email: config.customer.email },
    customData: config.custom_data,
  });
}
