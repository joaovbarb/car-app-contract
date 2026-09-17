/** Stable public meanings; registry parity is tested. Safe to import into a frontend. */
export const specDefinitions = [
  { key: "fuel_type", label: "Powertrain", type: "enum", unit: null, description: "Resolved fuel or powertrain type." },
  { key: "boot_l", label: "Boot capacity", type: "number", unit: "l", description: "Rear seats upright; excludes frunk." },
  { key: "boot_l_max", label: "Maximum boot capacity", type: "number", unit: "l", description: "Rear seats folded." },
  { key: "power_kw", label: "Power", type: "number", unit: "kW", description: "Engine or motor power." },
  { key: "displacement_cc", label: "Engine displacement", type: "number", unit: "cm³", description: "Not applicable to BEVs." },
  { key: "battery_capacity_kwh", label: "Battery capacity (unspecified basis)", type: "number", unit: "kWh", description: "Source does not distinguish gross from usable capacity." },
  { key: "battery_gross_kwh", label: "Gross battery capacity", type: "number", unit: "kWh", description: "Explicit gross, total or nominal energy; distinct from usable." },
  { key: "battery_usable_kwh", label: "Usable battery capacity", type: "number", unit: "kWh", description: "Explicit net or usable energy." },
  { key: "drivetrain", label: "Driven wheels", type: "enum", unit: null, description: "FWD, RWD, AWD or other resolved layout." },
  { key: "zero_to_100_s", label: "0–100 km/h", type: "number", unit: "s", description: "Acceleration time from rest to 100 km/h." },
] as const;
