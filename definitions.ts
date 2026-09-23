/**
 * GENERATED from backend/interfaces/definitions.ts by `npm run contract:definitions -- --write`.
 * Do not edit by hand: a backend test fails whenever this file differs from the generated one.
 *
 * Stable public meanings: the architect's fixed specification and feature catalogues, in exactly the
 * field names and shape of the `/api/public/v2/definitions` response. Safe to import into a
 * frontend: no imports.
 *
 * Every definition has `key`, `label`, `category` (the group it is shown in), `description`,
 * `type` and `numericUnit`. A specification's `type` is `number` (a measurement in
 * `numericUnit`) or `enum` (one of `values`). A feature's `type` is `boolean` (has it or not),
 * `level` (one step of `levels`, ordered from least to most), `number` (a measurement in
 * `numericUnit`) or `number_with_window` (a measurement in `numericUnit`, comparable only between
 * equal charge windows). A feature a version lacks is `unavailable`, never a level.
 */
export const specDefinitions = [
  { key: "battery_capacity_nominal", label: "Battery, nominal capacity", category: "battery_and_charging", description: "Total (gross) battery capacity, as the manufacturer states it.", type: "number", numericUnit: "kWh" },
  { key: "battery_capacity_usable", label: "Battery, usable capacity", category: "battery_and_charging", description: "Energy the car can actually use (net capacity).", type: "number", numericUnit: "kWh" },
  { key: "range_wltp", label: "Range (WLTP)", category: "efficiency", description: "Combined range on the WLTP test cycle.", type: "number", numericUnit: "km" },
  { key: "consumption_wltp", label: "Consumption (WLTP)", category: "efficiency", description: "Combined energy consumption on the WLTP test cycle.", type: "number", numericUnit: "kWh/100 km" },
  { key: "power", label: "Power", category: "performance", description: "Maximum power of the motors combined.", type: "number", numericUnit: "kW" },
  { key: "torque", label: "Torque", category: "performance", description: "Maximum torque of the motors combined.", type: "number", numericUnit: "Nm" },
  { key: "dc_charging_power_max", label: "Maximum DC charging power", category: "battery_and_charging", description: "Highest charging power on a DC fast charger.", type: "number", numericUnit: "kW" },
  { key: "ac_charging_power_max", label: "Maximum AC charging power", category: "battery_and_charging", description: "Highest charging power on AC, set by the on-board charger.", type: "number", numericUnit: "kW" },
  { key: "acceleration_0_100", label: "0-100 km/h", category: "performance", description: "Time from standstill to 100 km/h.", type: "number", numericUnit: "s" },
  { key: "top_speed", label: "Top speed", category: "performance", description: "Maximum speed.", type: "number", numericUnit: "km/h" },
  { key: "drivetrain", label: "Drivetrain", category: "performance", description: "Driven wheels: front, rear or all.", type: "enum", numericUnit: null, values: ["fwd", "rwd", "awd"] },
  { key: "length", label: "Length", category: "dimensions", description: "Overall length.", type: "number", numericUnit: "mm" },
  { key: "width", label: "Width", category: "dimensions", description: "Overall width, without mirrors unless the source says otherwise.", type: "number", numericUnit: "mm" },
  { key: "height", label: "Height", category: "dimensions", description: "Overall height.", type: "number", numericUnit: "mm" },
  { key: "boot_volume", label: "Boot, seats up", category: "dimensions", description: "Boot volume with the rear seats up.", type: "number", numericUnit: "l" },
  { key: "boot_volume_max", label: "Boot, maximum", category: "dimensions", description: "Boot volume with the rear seats folded.", type: "number", numericUnit: "l" },
  { key: "empty_weight", label: "Empty weight", category: "dimensions", description: "Weight in running order, as the manufacturer states it.", type: "number", numericUnit: "kg" },
] as const;

export const featureDefinitions = [
  { key: "heat_pump", label: "Heat pump", category: "charging", description: "Heat pump for cabin heating, which saves range in the cold.", type: "boolean", numericUnit: null },
  { key: "battery_preconditioning", label: "Battery pre-conditioning", category: "charging", description: "Warms or cools the battery before fast charging.", type: "boolean", numericUnit: null },
  { key: "head_up_display", label: "Head-up display", category: "driver_assistance", description: "Driving information projected in the driver's view.", type: "boolean", numericUnit: null },
  { key: "heated_steering_wheel", label: "Heated steering wheel", category: "comfort", description: "Heated steering wheel.", type: "boolean", numericUnit: null },
  { key: "keyless_entry_start", label: "Keyless entry and start", category: "comfort", description: "Unlocks and starts without taking out the key.", type: "boolean", numericUnit: null },
  { key: "bidirectional_charging", label: "Bidirectional charging", category: "charging", description: "Supplies power from the battery: to devices (V2L), a home (V2H) or the grid (V2G).", type: "level", numericUnit: null, levels: ["v2l", "v2h", "v2g"] },
  { key: "climate_control", label: "Climate control", category: "comfort", description: "Type of climate control, from manual to multi-zone.", type: "level", numericUnit: null, levels: ["manual", "automatic", "2_zone", "3_zone", "4_zone"] },
  { key: "parking_camera", label: "Parking camera", category: "driver_assistance", description: "Parking camera: rear, front and rear, or 360°.", type: "level", numericUnit: null, levels: ["rear", "front_and_rear", "360"] },
  { key: "cruise_control", label: "Cruise control", category: "driver_assistance", description: "Cruise control, from standard to adaptive with lane centring.", type: "level", numericUnit: null, levels: ["standard", "adaptive", "adaptive_lane_centring"] },
  { key: "seat_adjustment", label: "Seat adjustment", category: "comfort", description: "How the front seats adjust: manual, electric, electric with memory.", type: "level", numericUnit: null, levels: ["manual", "electric", "electric_memory"] },
  { key: "heated_seats", label: "Heated seats", category: "comfort", description: "Heated seats, front only or front and rear.", type: "level", numericUnit: null, levels: ["front", "front_and_rear"] },
  { key: "ventilated_seats", label: "Ventilated seats", category: "comfort", description: "Ventilated seats, front only or front and rear.", type: "level", numericUnit: null, levels: ["front", "front_and_rear"] },
  { key: "headlights", label: "Headlights", category: "exterior", description: "Headlight technology.", type: "level", numericUnit: null, levels: ["halogen", "led", "matrix_led"] },
  { key: "panoramic_roof", label: "Panoramic roof", category: "comfort", description: "Glass roof, fixed or opening.", type: "level", numericUnit: null, levels: ["fixed", "opening"] },
  { key: "tailgate", label: "Tailgate", category: "comfort", description: "How the tailgate opens: manual, electric, hands-free.", type: "level", numericUnit: null, levels: ["manual", "electric", "hands_free"] },
  { key: "apple_carplay", label: "Apple CarPlay", category: "infotainment", description: "Apple CarPlay, wired or wireless.", type: "level", numericUnit: null, levels: ["wired", "wireless"] },
  { key: "android_auto", label: "Android Auto", category: "infotainment", description: "Android Auto, wired or wireless.", type: "level", numericUnit: null, levels: ["wired", "wireless"] },
  { key: "wheel_size", label: "Wheel size", category: "exterior", description: "Wheel diameter.", type: "number", numericUnit: "in" },
  { key: "central_screen_size", label: "Central screen", category: "infotainment", description: "Size of the central touchscreen.", type: "number", numericUnit: "in" },
  { key: "dc_charging_time", label: "DC charging time", category: "charging", description: "Time to charge on DC between the stated levels.", type: "number_with_window", numericUnit: "min" },
] as const;
