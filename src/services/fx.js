import { supabase } from "../lib/supabase";
import { today } from "../utils/helpers";

const FX_URL = (base) => `https://open.er-api.com/v6/latest/${base}`;

export async function getRates(baseCurrency) {
  if (!supabase) {
    return { [baseCurrency]: 1 };
  }

  const rateDate = today();
  const { data: cached } = await supabase
    .from("fx_rates_cache")
    .select("rates")
    .eq("base_currency", baseCurrency)
    .eq("rate_date", rateDate)
    .maybeSingle();

  if (cached?.rates) {
    return cached.rates;
  }

  try {
    const res = await fetch(FX_URL(baseCurrency));
    const json = await res.json();
    const rates = json?.rates || { [baseCurrency]: 1 };

    await supabase.from("fx_rates_cache").upsert(
      {
        base_currency: baseCurrency,
        rate_date: rateDate,
        rates,
      },
      { onConflict: "base_currency,rate_date" }
    );

    return rates;
  } catch (_err) {
    return { [baseCurrency]: 1 };
  }
}

export async function convertToBase(amountOriginal, fromCurrency, baseCurrency) {
  if (!amountOriginal || !fromCurrency || !baseCurrency) {
    return { fxRate: 1, amountBase: Number(amountOriginal) || 0 };
  }

  if (fromCurrency === baseCurrency) {
    return { fxRate: 1, amountBase: Number(amountOriginal) || 0 };
  }

  const rates = await getRates(baseCurrency);
  const toRate = Number(rates[fromCurrency]);
  if (!toRate || Number.isNaN(toRate)) {
    return { fxRate: 1, amountBase: Number(amountOriginal) || 0 };
  }

  return {
    fxRate: 1 / toRate,
    amountBase: Number((Number(amountOriginal) / toRate).toFixed(2)),
  };
}

