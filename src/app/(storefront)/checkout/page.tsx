"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Truck, CreditCard, ShieldCheck, ArrowRight, Check } from "lucide-react";
import { useCart } from "@/stores/cartStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

type Step = 1 | 2 | 3;
const STEPS = [
  { n: 1, label: "Customer", Icon: MapPin },
  { n: 2, label: "Delivery", Icon: Truck },
  { n: 3, label: "Payment", Icon: CreditCard },
] as const;

export default function CheckoutPage() {
  const { lines, subtotal } = useCart();
  const [step, setStep] = useState<Step>(1);
  const sub = subtotal();
  const shipping = step === 2 ? 0 : 0; // updated by delivery choice
  const tax = 0;
  const total = sub + shipping + tax;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ---- Form column ---- */}
        <div className="lg:col-span-7">
          <h1 className="text-display-md font-bold">Secure Checkout</h1>

          {/* Stepper */}
          <div className="mt-7 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-hairline -z-0">
              <motion.div
                className="h-full bg-kale-500"
                initial={{ width: 0 }}
                animate={{ width: `${((step - 1) / 2) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="relative flex justify-between">
              {STEPS.map(({ n, label, Icon }) => {
                const done = n < step;
                const active = n === step;
                return (
                  <div key={n} className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full grid place-items-center transition-colors duration-300 z-10",
                        done
                          ? "bg-kale-500 text-white"
                          : active
                          ? "bg-kale-500 text-white ring-4 ring-kale-100"
                          : "bg-white border-2 border-hairline text-ink-ghost"
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider",
                        active ? "text-ink" : "text-ink-muted"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step bodies */}
          <div className="mt-10">
            <AnimatePresence mode="wait">
              {step === 1 && <ShippingForm key="1" onContinue={() => setStep(2)} />}
              {step === 2 && (
                <DeliveryForm
                  key="2"
                  onBack={() => setStep(1)}
                  onContinue={() => setStep(3)}
                />
              )}
              {step === 3 && (
                <PaymentForm key="3" onBack={() => setStep(2)} onComplete={() => {}} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ---- Order summary ---- */}
        <div className="lg:col-span-5">
          <div className="rounded-panel border border-hairline p-6 sticky top-24">
            <h3 className="font-bold text-lg">Order Summary</h3>
            <p className="text-xs text-ink-muted mt-0.5">{lines.length} fresh items in your blend</p>

            <ul className="mt-5 space-y-4">
              {lines.slice(0, 3).map((line) => (
                <li key={line.lineId} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-card overflow-hidden bg-cream shrink-0">
                    <Image src={line.imageUrl} alt={line.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{line.name}</div>
                    <div className="text-xs text-ink-muted">Qty: {line.quantity}</div>
                  </div>
                  <div className="text-sm font-bold tabular-nums">
                    ${(line.unitPrice * line.quantity).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-5 border-t border-hairline space-y-2.5 text-sm">
              <Row label="Subtotal" value={`$${sub.toFixed(2)}`} />
              <Row label="Shipping" value={<span className="text-kale-700 font-bold">FREE</span>} />
              <Row label="Estimated Taxes" value="$0.00" />
            </div>

            <div className="mt-5 pt-5 border-t border-hairline flex items-baseline justify-between">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-bold text-kale-700 tabular-nums">${total.toFixed(2)}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                className="flex-1 h-10 rounded-lg border border-hairline px-3 text-sm focus:outline-none focus:border-kale-500 focus:ring-2 focus:ring-kale-100"
              />
              <Button variant="outline" size="sm">
                Apply
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-hairline text-xs text-ink-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-kale-600" />
              <span className="font-semibold text-ink">SECURE SSL ENCRYPTED CHECKOUT</span>
            </div>

            <p className="mt-4 text-xs text-ink-muted leading-relaxed">
              By placing your order, you agree to KcBlendz's{" "}
              <a href="#" className="text-kale-700 hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-kale-700 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function ShippingForm({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-bold flex items-center gap-2 mb-5">
        <span className="h-7 w-7 rounded-full bg-kale-500 text-white text-xs font-bold grid place-items-center">
          1
        </span>
        Shipping Information
      </h2>
      <div className="rounded-card border border-hairline p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First Name" defaultValue="Alex" />
          <Input label="Last Name" defaultValue="Chen" />
        </div>
        <Input label="Email Address" type="email" defaultValue="alex.chen@design.com" />
        <Input label="Street Address" defaultValue="123 Wellness Way" />
        <div className="grid grid-cols-3 gap-3">
          <Input label="City" defaultValue="San Francisco" />
          <Input label="State" defaultValue="CA" />
          <Input label="ZIP" defaultValue="94103" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-kale-500 accent-kale-500" />
          <span className="text-sm text-ink-soft">Save this information for next time</span>
        </label>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onContinue} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Continue to Delivery
        </Button>
      </div>
    </motion.div>
  );
}

function DeliveryForm({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const [method, setMethod] = useState<"standard" | "express">("standard");
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-bold flex items-center gap-2 mb-5">
        <span className="h-7 w-7 rounded-full bg-kale-500 text-white text-xs font-bold grid place-items-center">
          2
        </span>
        Delivery Method
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DeliveryOption
          active={method === "standard"}
          onClick={() => setMethod("standard")}
          title="Standard Shipping"
          subtitle="3-5 Business Days"
          price="FREE"
        />
        <DeliveryOption
          active={method === "express"}
          onClick={() => setMethod("express")}
          title="Express Blend"
          subtitle="Next Day Delivery"
          price="$12.00"
        />
      </div>
      <div className="mt-4 rounded-card bg-mint p-4 text-xs text-ink-muted flex gap-2">
        <Truck className="h-4 w-4 text-kale-600 shrink-0 mt-0.5" />
        All smoothies are shipped in eco-friendly insulated packaging with dry ice to maintain freshness. Delivery is guaranteed before 6 PM on the estimated day.
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onContinue} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Continue to Payment
        </Button>
      </div>
    </motion.div>
  );
}

function DeliveryOption({
  active,
  onClick,
  title,
  subtitle,
  price,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  price: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-card border p-4 text-left transition-all",
        active
          ? "border-kale-500 ring-2 ring-kale-100 bg-kale-50/50"
          : "border-hairline hover:border-ink/20"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="font-bold text-sm">{title}</div>
        <div className={cn("text-sm font-bold", price === "FREE" ? "text-kale-700" : "text-ink")}>
          {price}
        </div>
      </div>
      <div className="text-xs text-ink-muted mt-1">{subtitle}</div>
    </button>
  );
}

function PaymentForm({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-bold flex items-center gap-2 mb-5">
        <span className="h-7 w-7 rounded-full bg-kale-500 text-white text-xs font-bold grid place-items-center">
          3
        </span>
        Payment Details
      </h2>
      <div className="rounded-card border border-hairline p-6 space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border border-hairline">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-ink-muted" />
            <span className="font-semibold">Credit or Debit Card</span>
          </div>
        </div>
        <Input label="Cardholder Name" placeholder="Full Name on Card" />
        <Input label="Card Number" placeholder="0000 0000 0000 0000" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Expiry Date" placeholder="MM / YY" />
          <Input label="CVV" placeholder="123" />
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onComplete} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Complete Order
        </Button>
      </div>
    </motion.div>
  );
}
