import { DEFAULT_MARKET, type Market } from "@/lib/i18n/config";
import { en, fr, type Messages } from "@/lib/i18n/messages";

export type MessageVars = Record<string, string | number>;

export type TFunction = {
  (key: string, vars?: MessageVars): string;
  plural: (key: string, count: number, vars?: MessageVars) => string;
};

type Dict = Messages | (typeof fr);

function lookup(dict: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as object)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
}

function interpolate(template: string, vars?: MessageVars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`,
  );
}

function messagesFor(market: Market): Dict {
  return market === "eu" ? fr : en;
}

export function makeT(market: Market = DEFAULT_MARKET): TFunction {
  const dict = messagesFor(market);
  const t = ((key: string, vars?: MessageVars) => {
    let val = lookup(dict, key);
    if (typeof val !== "string") val = lookup(en, key);
    if (typeof val !== "string") return key;
    return interpolate(val, vars);
  }) as TFunction;

  t.plural = (key, count, vars) => {
    let val = lookup(dict, key);
    if (!val || typeof val !== "object") val = lookup(en, key);
    const rec = val as { one?: string; other?: string } | undefined;
    const useOne = market === "eu" ? count <= 1 : count === 1;
    const template = (useOne ? rec?.one : rec?.other) ?? rec?.other ?? rec?.one;
    if (typeof template !== "string") return key;
    return interpolate(template, { count, ...vars });
  };

  return t;
}

export function messages(market: Market): Dict {
  return messagesFor(market);
}
