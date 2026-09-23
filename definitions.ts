/**
 * Stable public meanings: the architect's fixed specification and feature catalogues, mirrored
 * exactly -- keys, labels, value types, units, enumerated values and ladders -- from
 * backend/interfaces/definitions.ts, which is the source of truth. A parity test fails whenever the
 * two differ. Safe to import into a frontend: no imports.
 *
 * A specification is a number in `unit`, or one of `values` when `valueType` is `enum`. A feature
 * is `boolean` (has it or not), `level` (one step of `levels`, ordered from least to most),
 * `number` (a measurement in `unit`) or `number_with_window` (a measurement in `unit`, comparable
 * only between equal charge windows).
 */
export const specDefinitions = [
  { key: "battery_capacity_nominal", label: "Battery, nominal capacity", valueType: "number", unit: "kWh" },
  { key: "battery_capacity_usable", label: "Battery, usable capacity", valueType: "number", unit: "kWh" },
  { key: "range_wltp", label: "Range (WLTP)", valueType: "number", unit: "km" },
  { key: "consumption_wltp", label: "Consumption (WLTP)", valueType: "number", unit: "kWh/100 km" },
  { key: "power", label: "Power", valueType: "number", unit: "kW" },
  { key: "torque", label: "Torque", valueType: "number", unit: "Nm" },
  { key: "dc_charging_power_max", label: "Maximum DC charging power", valueType: "number", unit: "kW" },
  { key: "ac_charging_power_max", label: "Maximum AC charging power", valueType: "number", unit: "kW" },
  { key: "acceleration_0_100", label: "0-100 km/h", valueType: "number", unit: "s" },
  { key: "top_speed", label: "Top speed", valueType: "number", unit: "km/h" },
  { key: "drivetrain", label: "Drivetrain", valueType: "enum", unit: null, values: ["fwd", "rwd", "awd"] },
  { key: "length", label: "Length", valueType: "number", unit: "mm" },
  { key: "width", label: "Width", valueType: "number", unit: "mm" },
  { key: "height", label: "Height", valueType: "number", unit: "mm" },
  { key: "boot_volume", label: "Boot, seats up", valueType: "number", unit: "l" },
  { key: "boot_volume_max", label: "Boot, maximum", valueType: "number", unit: "l" },
  { key: "empty_weight", label: "Empty weight", valueType: "number", unit: "kg" },
] as const;

export const featureDefinitions = [
  { key: "heat_pump", label: "Heat pump", type: "boolean" },
  { key: "battery_preconditioning", label: "Battery pre-conditioning", type: "boolean" },
  { key: "head_up_display", label: "Head-up display", type: "boolean" },
  { key: "heated_steering_wheel", label: "Heated steering wheel", type: "boolean" },
  { key: "keyless_entry_start", label: "Keyless entry and start", type: "boolean" },
  { key: "bidirectional_charging", label: "Bidirectional charging", type: "level", levels: ["none", "v2l", "v2h", "v2g"] },
  { key: "climate_control", label: "Climate control", type: "level", levels: ["manual", "automatic", "2_zone", "3_zone", "4_zone"] },
  { key: "parking_camera", label: "Parking camera", type: "level", levels: ["none", "rear", "front_and_rear", "360"] },
  { key: "cruise_control", label: "Cruise control", type: "level", levels: ["standard", "adaptive", "adaptive_lane_centring"] },
  { key: "seat_adjustment", label: "Seat adjustment", type: "level", levels: ["manual", "electric", "electric_memory"] },
  { key: "heated_seats", label: "Heated seats", type: "level", levels: ["none", "front", "front_and_rear"] },
  { key: "ventilated_seats", label: "Ventilated seats", type: "level", levels: ["none", "front", "front_and_rear"] },
  { key: "headlights", label: "Headlights", type: "level", levels: ["halogen", "led", "matrix_led"] },
  { key: "panoramic_roof", label: "Panoramic roof", type: "level", levels: ["none", "fixed", "opening"] },
  { key: "tailgate", label: "Tailgate", type: "level", levels: ["manual", "electric", "hands_free"] },
  { key: "apple_carplay", label: "Apple CarPlay", type: "level", levels: ["none", "wired", "wireless"] },
  { key: "android_auto", label: "Android Auto", type: "level", levels: ["none", "wired", "wireless"] },
  { key: "wheel_size", label: "Wheel size", type: "number", unit: "in" },
  { key: "central_screen_size", label: "Central screen", type: "number", unit: "in" },
  { key: "dc_charging_time", label: "DC charging time", type: "number_with_window", unit: "min" },
] as const;
