/** Browser-safe v1 contracts. No server, database or provider imports. */
import { z } from "zod";

export const evidenceSchema = z.enum(["resolved", "unknown", "disputed", "not_applicable"]);
export const fitmentSchema = z.enum(["standard", "optional", "pack_only", "unavailable", "unknown"]);
/**
 * A powertrain is binary: `bev` is battery-electric only, `not_bev` is everything else (plug-in
 * hybrid, hybrid, mild hybrid, hydrogen fuel-cell, petrol, diesel). `all` is the non-narrowing
 * filter value and never appears as a published version's powertrain.
 */
export const powertrainSchema = z.enum(["bev", "not_bev", "all"]);
/** The consumer's powertrain filter: narrow to battery-electric, or do not narrow. */
export const powertrainFilterSchema = powertrainSchema.exclude(["not_bev"]);
const scalar = z.union([z.string(), z.number().finite(), z.boolean()]);
export const batteryBasisSchema = z.enum(["nominal", "usable", "unspecified"]);
export const valueSchema = z.object({ status: evidenceSchema, value: scalar.nullable(), unit: z.string().nullable(),
  /**
   * Not emitted: a battery is two specifications, battery_capacity_nominal and battery_capacity_usable
   * (an unqualified single figure is nominal), so a value's key already says its basis. Kept optional
   * for compatibility; never an estimated conversion.
   */
  batteryBasis: batteryBasisSchema.optional() });
export const provenanceSchema = z.object({ title: z.string(), url: z.url(), checkedAt: z.iso.datetime().nullable() });
export const photoSchema = z.object({ url: z.url(), width: z.number().int().positive().nullable(), height: z.number().int().positive().nullable(),
  order: z.number().int().nonnegative(), label: z.string(), attribution: z.string().nullable(), representative: z.boolean(),
  scope: z.enum(["model_wide", "generation_wide", "trim_specific"]), equipmentDisclaimer: z.string() });
/**
 * The kind of source a price came from. `official`: the manufacturer's own. `dealer_estimate`: a
 * dealer's. `unclassified`: the source could not be classified as the manufacturer's own or a
 * dealer's, so the price is reported without that claim.
 */
export const priceMethodSchema = z.enum(["official", "dealer_estimate", "unclassified"]);
export const priceSchema = z.object({ versionId: z.uuid(), amountMinor: z.number().int().positive(), currency: z.string().length(3),
  taxInclusive: z.literal(true), taxBasis: z.enum(["explicit_included", "explicit_excluded_converted", "market_convention"]),
  method: priceMethodSchema, lastSuccessfulCheck: z.iso.datetime().nullable(),
  freshness: z.enum(["fresh", "stale", "unverified"]), validUntil: z.iso.date().nullable(), estimated: z.literal(true),
  source: provenanceSchema.nullable() });
/**
 * A published feature. `fitment` is its equipment status; `numeric` carries the number of a `number`
 * or `number_with_window` feature. `attributes` carries `level` for a `level` feature, `note` (the
 * source's own wording, shown and never compared) when there is one, and `fromPercent` and
 * `toPercent` for a charge window.
 */
export const featureSchema = z.object({ key: z.string(), featureKey: z.string(), label: z.string(), category: z.string().nullable(),
  attributes: z.record(z.string(), scalar), evidence: evidenceSchema, fitment: fitmentSchema, numeric: valueSchema });
export const availabilitySchema = z.enum(["confirmed_current", "unknown", "historical", "not_yet_available"]);
export const versionSchema = z.object({ id: z.uuid(), modelId: z.uuid(), market: z.string().length(2), name: z.string(),
  make: z.string(), model: z.string(), generation: z.string().nullable(), modelYear: z.number().int().nullable(),
  equipmentGrade: z.string(), technicalConfiguration: z.object({ batteryLabel: z.string().nullable(), motorLabel: z.string().nullable(), drivetrain: z.string().nullable() }),
  publication: z.literal("published"), powertrain: powertrainSchema.exclude(["all"]), availability: availabilitySchema,
  specs: z.record(z.string(), valueSchema), features: z.array(featureSchema), price: priceSchema.nullable(),
  /** @deprecated Use data.photos from GET /models/{modelId}; retained for legacy clients only. */
  photos: z.array(photoSchema),
  facts: z.array(z.object({ text: z.string(), scope: z.enum(["model", "generation", "trim"]), source: provenanceSchema })) });
export const modelSchema = z.object({ id: z.uuid(), makeId: z.uuid(), make: z.string(), name: z.string(), aliases: z.array(z.string()),
  market: z.string(), availability: availabilitySchema, publication: z.enum(["model_only", "has_published_versions"]),
  publishedVersionCount: z.number().int().nonnegative(), photo: photoSchema.nullable(),
  priceSummary: z.object({ label: z.literal("Lowest known trim price"), coverage: z.literal("incomplete"), price: priceSchema }).nullable() });
export const preferenceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("spec"), key: z.string().min(1).max(80), op: z.enum(["gte", "lte", "eq"]), value: scalar }).strict(),
  z.object({ kind: z.literal("feature"), key: z.string().min(1).max(160), fitment: fitmentSchema.exclude(["unknown"]) }).strict(),
  z.object({ kind: z.literal("price"), maxAmountMinor: z.number().int().positive().max(2_000_000_000) }).strict(),
]);
export const matchSchema = z.object({ result: z.enum(["match", "mismatch", "unknown"]), reasons: z.array(z.string()) });
export const querySchema = z.object({ market: z.string().regex(/^[A-Z]{2}$/).default("PT"), powertrain: powertrainFilterSchema.default("bev"),
  q: z.string().trim().max(100).default(""), makeId: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20), offset: z.coerce.number().int().min(0).max(10000).default(0),
  includeHistorical: z.enum(["true", "false"]).default("false").transform(v => v === "true"),
  uncertainty: z.enum(["strict", "include"]).default("strict"),
  preferences: z.string().max(4000).optional().transform((v, ctx) => {
    if (!v) return [];
    try { return z.array(preferenceSchema).max(10).parse(JSON.parse(v)); }
    catch { ctx.addIssue({ code: "custom", message: "Invalid preferences" }); return z.NEVER; }
  }), ids: z.string().max(200).optional().transform((v, ctx) => {
    if (v === undefined) return [];
    const result = z.array(z.uuid()).min(2).max(4).refine(ids => new Set(ids).size === ids.length).safeParse(v.split(","));
    if (!result.success) { ctx.addIssue({ code: "custom", message: "Compare requires 2–4 distinct UUIDs" }); return z.NEVER; }
    return result.data;
  }) }).strict();
/**
 * How a feature is compared. `boolean`: has it or not. `level`: one step of its `levels`, ordered from
 * least to most. `number`: a measurement in `numericUnit`. `number_with_window`: a measurement in
 * `numericUnit`, comparable only between equal charge windows.
 */
export const featureTypeSchema = z.enum(["boolean", "level", "number", "number_with_window"]);
/**
 * A feature definition. `type` and `levels` (the ladder, least to most, for a `level` feature; null
 * otherwise) are optional only so responses served before they existed still parse.
 */
export const featureDefinitionSchema = z.object({ key: z.string(), label: z.string(), description: z.string().nullable(),
  category: z.string().nullable(), numericUnit: z.string().nullable(), type: featureTypeSchema.optional(),
  levels: z.array(z.string()).nullable().optional() });
export const definitionSchema = z.object({ key: z.string(), label: z.string(), description: z.string(), type: z.enum(["number", "enum", "boolean", "string"]), unit: z.string().nullable() });
export const responseSchema = z.object({ apiVersion: z.literal("1"), asOf: z.iso.datetime(), market: z.string(), powertrain: powertrainFilterSchema,
  data: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("makes"), items: z.array(z.object({ id: z.uuid(), name: z.string() })), nextOffset: z.number().int().nullable() }),
    z.object({ kind: z.literal("models"), items: z.array(modelSchema), nextOffset: z.number().int().nullable() }),
    z.object({ kind: z.literal("model"), model: modelSchema,
      /** Canonical model gallery. Optional only during rollout: absent is not an empty gallery. */
      photos: z.array(photoSchema).optional(),
      versions: z.array(versionSchema), nextOffset: z.number().int().nullable() }),
    z.object({ kind: z.literal("version"), version: versionSchema, preferenceMatch: matchSchema }),
    z.object({ kind: z.literal("comparison"), versions: z.array(versionSchema), specs: z.array(z.object({ key: z.string(), cells: z.array(valueSchema) })),
      features: z.array(z.object({ key: z.string(), cells: z.array(featureSchema) })), matches: z.array(z.object({ versionId: z.uuid(), match: matchSchema })) }),
    z.object({ kind: z.literal("definitions"), specs: z.array(definitionSchema), features: z.array(featureDefinitionSchema) }),
  ]) });
export const errorSchema = z.object({ apiVersion: z.literal("1"), error: z.object({ code: z.enum(["INVALID_REQUEST", "MARKET_UNAVAILABLE", "NOT_FOUND", "METHOD_NOT_ALLOWED", "TEMPORARILY_UNAVAILABLE"]), message: z.string() }) });
export type Query = z.infer<typeof querySchema>;
export type Version = z.infer<typeof versionSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type ModelCard = z.infer<typeof modelSchema>;
export type Preference = z.infer<typeof preferenceSchema>;
export type ResponseData = z.infer<typeof responseSchema>["data"];

export type Photo = z.infer<typeof photoSchema>;
export type BatteryBasis = z.infer<typeof batteryBasisSchema>;
export type PriceMethod = z.infer<typeof priceMethodSchema>;
export type ModelDetail = Extract<ResponseData, { kind: "model" }>;
