import { DEFAULT_EUR_PER_NAD } from "../lib/i18n/config";
import { nadToEur, eurToNad, formatMoney } from "../lib/i18n/currency";
import { detectMarketFromSignals, prefersFrench } from "../lib/i18n/detect";
import { makeT } from "../lib/i18n/translate";
import { SHIPPING_METHODS } from "../lib/shipping";

function fail(msg: string) {
  console.error(`FAIL ${msg}`);
  process.exitCode = 1;
}

if (DEFAULT_EUR_PER_NAD !== 0.05) fail("default rate is not 0.05");
if (nadToEur(100) !== 5) fail(`N$100 → ${nadToEur(100)} EUR, expected 5`);
if (nadToEur(150) !== 7.5) fail(`N$150 → ${nadToEur(150)} EUR, expected 7.5`);
if (eurToNad(5) !== 100) fail(`€5 → ${eurToNad(5)} NAD, expected 100`);
if (!formatMoney(2555, "na").includes("N$")) fail("NAD format missing N$");
if (!formatMoney(2555, "eu").includes("€") && !formatMoney(2555, "eu").includes("EUR")) {
  fail(`EUR format unexpected: ${formatMoney(2555, "eu")}`);
}

if (detectMarketFromSignals({}) !== "na") fail("default market is not Namibia");
if (detectMarketFromSignals({ country: "NA", acceptLanguage: "fr" }) !== "na") {
  fail("Namibia geo must win over French language (Namibia-first)");
}
if (detectMarketFromSignals({ country: "FR" }) !== "eu") fail("FR geo should be EU market");
if (detectMarketFromSignals({ acceptLanguage: "fr-FR,fr;q=0.9,en;q=0.8" }) !== "eu") {
  fail("French Accept-Language should be EU market");
}
if (detectMarketFromSignals({ acceptLanguage: "en-US,en;q=0.9" }) !== "na") {
  fail("English Accept-Language should stay Namibia");
}
if (detectMarketFromSignals({ cookie: "eu", country: "NA" }) !== "eu") {
  fail("manual cookie must override geo");
}
if (!prefersFrench("fr")) fail("prefersFrench('fr')");
if (prefersFrench("en-US,fr;q=0.4")) fail("English-first should not prefer French");

const costs = Object.fromEntries(SHIPPING_METHODS.map((m) => [m.id, m.cost]));
if (costs.standard !== 100 || costs.express !== 150 || costs.pickup !== 0) {
  fail("shipping NAD rates drifted from 100/150/0");
}

const tFr = makeT("eu");
const tEn = makeT("na");
if (tEn("nav.cart") === tFr("nav.cart")) fail("FR cart label matches EN");
if (tFr("shipping.pickup") === tEn("shipping.pickup")) fail("FR pickup label matches EN");
if (!tFr("checkout.emptyHint").includes("{standard}")) fail("FR empty checkout hint missing rate slots");

if (!process.exitCode) console.log("i18n checks ok");
