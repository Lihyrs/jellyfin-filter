import { UNITS } from "../comm/constant";
export function convertToBytes(value, unit) {
	return parseFloat(value) * (unit || 1);
}

export function convertToGB(value, decimal = 2) {
	return (parseFloat(value) / UNITS.GB).toFixed(decimal);
}
