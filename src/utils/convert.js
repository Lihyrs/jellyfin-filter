import { UNITS } from "../comm/constant";
export function convertToBytes(value, unit) {
	return parseFloat(value) * (UNITS[unit.toUpperCase()] || 1);
}

export function convertToGB(value, decimal = 2) {
	return parseFloat(value) / UNITS.GB.toFixed(decimal);
}
