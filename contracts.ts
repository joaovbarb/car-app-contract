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
export const valueSchema = z.object({ status: evidenceSchema, value: scalar.nullable(), unit: z.string().nullable() });
/** Which capacity a version's `battery` figure is: nominal (gross) or usable (net). */
export const batteryBasisSchema = z.enum(["nominal", "usable"]);
/**
 * A version's battery as one figure: the nominal capacity when known, otherwise the usable one, never
 * converted from the other. Null when neither is known. Both figures stay in `specs`
 * (`battery_capacity_nominal`, `battery_capacity_usable`).
 */
export const batterySchema = z.object({ capacityKwh: z.number().positive(), basis: batteryBasisSchema });
export const provenanceSchema = z.object({ title: z.string(), url: z.url(), checkedAt: z.iso.datetime().nullable() });
/**
 * A published photo. `attribution`: the name of the site the photo was found on, e.g. "audi.com"; `sourceUrl`: the
 * page the photo was found on (round 53). Both null when the photo's source page is not known. Showing a credit is
 * the site's choice.
 */
export const photoSchema = z.object({ url: z.url(), width: z.number().int().positive().nullable(), height: z.number().int().positive().nullable(),
  order: z.number().int().nonnegative(), label: z.string(), attribution: z.string().nullable(), sourceUrl: z.string().nullable(),
  representative: z.boolean(),
  scope: z.enum(["model_wide", "generation_wide", "trim_specific"]), equipmentDisclaimer: z.string() });
/**
 * The kind of source a price came from. `official`: the manufacturer's own. `dealer_estimate`: a
 * dealer's. `unclassified`: the source could not be classified as the manufacturer's own or a
 * dealer's, so the price is reported without that claim.
 */
export const priceMethodSchema = z.enum(["official", "dealer_estimate", "unclassified"]);
/**
 * A version's shown price. `amountMinor` is in minor units (cents) and, since round 74, always a whole number of euros
 * (a multiple of 100): public prices are rounded to the euro, half up.
 */
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
/**
 * The backend's own availability values. `current`: on sale. `upcoming`: announced, not yet on sale.
 * `discontinued`: no longer sold; served only with `includeDiscontinued=true`. `unknown`: not
 * established either way, which is not confirmation of sale.
 */
export const availabilitySchema = z.enum(["current", "upcoming", "discontinued", "unknown"]);
export const versionSchema = z.object({ id: z.uuid(), modelId: z.uuid(), market: z.string().length(2), name: z.string(),
  make: z.string(), model: z.string(), generation: z.string().nullable(), modelYear: z.number().int().nullable(),
  equipmentGrade: z.string(), technicalConfiguration: z.object({ batteryLabel: z.string().nullable(), motorLabel: z.string().nullable(), drivetrain: z.string().nullable() }),
  publication: z.literal("published"), powertrain: powertrainSchema.exclude(["all"]), availability: availabilitySchema,
  /**
   * True when the version is retired: the manufacturer no longer sells it (round 37). A retired version is served
   * by its ID and in `compare`, marked, so saved IDs stay valid; it is left out of model lists, version lists within
   * a model, prices and counts.
   */
  retired: z.boolean(),
  /** When the version was retired (UTC ISO timestamp); null when it is not retired. */
  retiredAt: z.iso.datetime().nullable(),
  specs: z.record(z.string(), valueSchema), battery: batterySchema.nullable(), features: z.array(featureSchema),
  price: priceSchema.nullable(),
  /** @deprecated Use data.photos from GET /models/{modelId}; retained for legacy clients only. */
  photos: z.array(photoSchema),
  facts: z.array(z.object({ text: z.string(), scope: z.enum(["model", "generation", "trim"]), source: provenanceSchema })) });
export const modelSchema = z.object({ id: z.uuid(), makeId: z.uuid(), make: z.string(), name: z.string(), aliases: z.array(z.string()),
  market: z.string(), availability: availabilitySchema, publication: z.enum(["model_only", "has_published_versions"]),
  publishedVersionCount: z.number().int().nonnegative(), photo: photoSchema.nullable(),
  priceSummary: z.object({ label: z.literal("Lowest known trim price"), coverage: z.literal("incomplete"), price: priceSchema }).nullable() });
/**
 * A model in a list (`/models`): its card plus `coverageScore`, how well documented the model is, 0-100:
 * priced versions 40, versions with specifications 30, good photos 20 (at least 1,024 px, up to ten), an
 * exterior main photo 10 (round 46).
 */
export const listedModelSchema = modelSchema.extend({ coverageScore: z.number().min(0).max(100) });
/** The order of a models list: `name` (default, by make and model name) or `coverage` (highest `coverageScore` first, ties by name). */
export const modelSortSchema = z.enum(["name", "coverage"]);
export const preferenceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("spec"), key: z.string().min(1).max(80), op: z.enum(["gte", "lte", "eq"]), value: scalar }).strict(),
  z.object({ kind: z.literal("feature"), key: z.string().min(1).max(160), fitment: fitmentSchema.exclude(["unknown"]) }).strict(),
  z.object({ kind: z.literal("price"), maxAmountMinor: z.number().int().positive().max(2_000_000_000) }).strict(),
]);
export const matchSchema = z.object({ result: z.enum(["match", "mismatch", "unknown"]), reasons: z.array(z.string()) });
export const querySchema = z.object({ market: z.string().regex(/^[A-Z]{2}$/).default("PT"), powertrain: powertrainFilterSchema.default("bev"),
  q: z.string().trim().max(100).default(""), makeId: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20), offset: z.coerce.number().int().min(0).max(10000).default(0),
  includeDiscontinued: z.enum(["true", "false"]).default("false").transform(v => v === "true"),
  uncertainty: z.enum(["strict", "include"]).default("strict"),
  /** Models list only: `name` (default) or `coverage`. */
  sort: modelSortSchema.default("name"),
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
 * A feature definition, exactly as `featureDefinitions` in contract/definitions.ts. `levels` is the
 * ladder, least to most, of a `level` feature, and is absent otherwise; `numericUnit` is the unit of a
 * `number` or `number_with_window` feature, and null otherwise.
 */
export const featureDefinitionSchema = z.object({ key: z.string(), label: z.string(), category: z.string(),
  description: z.string(), type: featureTypeSchema, numericUnit: z.string().nullable(),
  levels: z.array(z.string()).optional() });
/**
 * A specification definition, exactly as `specDefinitions` in contract/definitions.ts. A `number`
 * specification is a measurement in `numericUnit`; an `enum` one is one of `values` (absent otherwise).
 */
export const definitionSchema = z.object({ key: z.string(), label: z.string(), category: z.string(),
  description: z.string(), type: z.enum(["number", "enum"]), numericUnit: z.string().nullable(),
  values: z.array(z.string()).optional() });
/** A version's driven wheels: front, rear or all (the `drivetrain` specification's values). */
export const drivetrainSchema = z.enum(["fwd", "rwd", "awd"]);
/**
 * Round 74: the price of a search-index row -- the version's shown price, the same one `/versions/{versionId}` serves.
 * `amountEur`: whole euros, taxes included (rounded half up from the stored amount). `verifiedAt`: when the price was
 * last confirmed on its source (UTC ISO timestamp), null when no check is recorded. `sourceKind`: the kind of source,
 * as a price's `method`.
 */
export const searchIndexPriceSchema = z.object({ amountEur: z.number().int().positive(),
  verifiedAt: z.iso.datetime().nullable(), sourceKind: priceMethodSchema });
/**
 * Round 74: one served version of the search index (`/search-index`). Every attribute is null when unknown -- never
 * zero. `batteryNominalKwh` is the nominal (gross) capacity only, kWh to 1 decimal (a usable figure never stands in);
 * `rangeWltpKm` the combined WLTP range, whole km; `lengthMm` and `heightMm` whole mm; `bootVolumeL` the boot with
 * the rear seats up, whole litres; `seats` the most seats the version can be ordered with.
 */
export const searchIndexVersionSchema = z.object({ modelId: z.uuid(), versionId: z.uuid(),
  price: searchIndexPriceSchema.nullable(), batteryNominalKwh: z.number().positive().nullable(),
  rangeWltpKm: z.number().int().positive().nullable(), drivetrain: drivetrainSchema.nullable(),
  lengthMm: z.number().int().positive().nullable(), heightMm: z.number().int().positive().nullable(),
  bootVolumeL: z.number().int().nonnegative().nullable(), seats: z.number().int().positive().nullable() });
/** Round 74: the smallest and largest known value of one attribute over the whole index; null when no row knows it. */
export const searchIndexDomainSchema = z.object({ min: z.number(), max: z.number() }).nullable();
/** Round 74: each numeric attribute's domain over the whole index (market and powertrain), never a page. */
export const searchIndexDomainsSchema = z.object({ priceEur: searchIndexDomainSchema,
  batteryNominalKwh: searchIndexDomainSchema, rangeWltpKm: searchIndexDomainSchema, lengthMm: searchIndexDomainSchema,
  heightMm: searchIndexDomainSchema, bootVolumeL: searchIndexDomainSchema, seats: searchIndexDomainSchema });
export const responseSchema = z.object({ apiVersion: z.literal("1"), asOf: z.iso.datetime(), market: z.string(), powertrain: powertrainFilterSchema,
  data: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("makes"), items: z.array(z.object({ id: z.uuid(), name: z.string() })), nextOffset: z.number().int().nullable() }),
    z.object({ kind: z.literal("models"), items: z.array(listedModelSchema), nextOffset: z.number().int().nullable() }),
    z.object({ kind: z.literal("model"), model: modelSchema,
      /** Canonical model gallery. Optional only during rollout: absent is not an empty gallery. */
      photos: z.array(photoSchema).optional(),
      versions: z.array(versionSchema), nextOffset: z.number().int().nullable() }),
    z.object({ kind: z.literal("version"), version: versionSchema, preferenceMatch: matchSchema }),
    z.object({ kind: z.literal("comparison"), versions: z.array(versionSchema), specs: z.array(z.object({ key: z.string(), cells: z.array(valueSchema) })),
      features: z.array(z.object({ key: z.string(), cells: z.array(featureSchema) })), matches: z.array(z.object({ versionId: z.uuid(), match: matchSchema })) }),
    z.object({ kind: z.literal("definitions"), specs: z.array(definitionSchema), features: z.array(featureDefinitionSchema) }),
    /**
     * Round 74: `/search-index` -- one row per served version, the domains over the whole index, and every
     * drivetrain value (`fwd`, `rwd`, `awd`) whether or not a row has it.
     */
    z.object({ kind: z.literal("search_index"), versions: z.array(searchIndexVersionSchema),
      domains: searchIndexDomainsSchema, drivetrains: z.array(drivetrainSchema) }),
  ]) });
export const errorSchema = z.object({ apiVersion: z.literal("1"), error: z.object({ code: z.enum(["INVALID_REQUEST", "MARKET_UNAVAILABLE", "NOT_FOUND", "METHOD_NOT_ALLOWED", "TEMPORARILY_UNAVAILABLE"]), message: z.string() }) });
export type Query = z.infer<typeof querySchema>;
export type Version = z.infer<typeof versionSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type ModelCard = z.infer<typeof modelSchema>;
export type ListedModel = z.infer<typeof listedModelSchema>;
export type ModelSort = z.infer<typeof modelSortSchema>;
export type Preference = z.infer<typeof preferenceSchema>;
export type ResponseData = z.infer<typeof responseSchema>["data"];

export type Photo = z.infer<typeof photoSchema>;
export type BatteryBasis = z.infer<typeof batteryBasisSchema>;
export type Battery = z.infer<typeof batterySchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type PriceMethod = z.infer<typeof priceMethodSchema>;
export type ModelDetail = Extract<ResponseData, { kind: "model" }>;
export type Drivetrain = z.infer<typeof drivetrainSchema>;
export type SearchIndexVersion = z.infer<typeof searchIndexVersionSchema>;
export type SearchIndexDomains = z.infer<typeof searchIndexDomainsSchema>;
export type SearchIndex = Extract<ResponseData, { kind: "search_index" }>;
