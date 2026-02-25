import { CompanionInputFieldNumber, CompanionInputFieldTextInput, InstanceBase } from '@companion-module/base'
import { OSCResponse } from './osc'

type EnforceDefault<T, U> = Omit<T, 'default'> & { default: U }

export interface Options {
	index: EnforceDefault<CompanionInputFieldNumber, number>
	indexVar: EnforceDefault<CompanionInputFieldTextInput, string>
	name: EnforceDefault<CompanionInputFieldTextInput, string>
	time: EnforceDefault<CompanionInputFieldNumber, number>
	timeVar: EnforceDefault<CompanionInputFieldTextInput, string>
	value: EnforceDefault<CompanionInputFieldNumber, number>
	valueVar: EnforceDefault<CompanionInputFieldTextInput, string>
}

export const options: Options = {
	index: {
		type: 'number',
		label: 'Index',
		id: 'index',
		default: 1,
		min: 1,
		max: 4096,
	},
	indexVar: {
		type: 'textinput',
		label: 'Index',
		id: 'index',
		default: '1',
		useVariables: true,
	},
	name: {
		type: 'textinput',
		label: 'Name',
		id: 'name',
		default: '',
		useVariables: true,
	},
	time: {
		type: 'number',
		label: 'Time',
		id: 'time',
		default: 0,
		min: -65535,
		max: 65535,
	},
	timeVar: {
		type: 'textinput',
		label: 'Time (seconds)',
		id: 'time',
		default: '0',
		useVariables: true,
	},
	value: {
		type: 'number',
		label: 'Value',
		id: 'value',
		default: 0,
		min: -65535,
		max: 65535,
	},
	valueVar: {
		type: 'textinput',
		label: 'Value',
		id: 'value',
		default: '0',
		useVariables: true,
	},
}

/**
 * Parse a variable-aware option value as a float.
 * Returns the parsed number, or NaN if invalid.
 */
export async function parseVariableNumber(
	instance: InstanceBaseExt<any>,
	action: { options: { [key: string]: any } },
	key: string,
): Promise<number> {
	const raw = action.options[key]
	if (typeof raw === 'number') return raw
	const resolved = await instance.parseVariablesInString(String(raw ?? ''))
	return parseFloat(resolved)
}

/**
 * Parse a variable-aware option value as an integer.
 * Returns the parsed integer, or NaN if invalid.
 */
export async function parseVariableInt(
	instance: InstanceBaseExt<any>,
	action: { options: { [key: string]: any } },
	key: string,
): Promise<number> {
	const raw = action.options[key]
	if (typeof raw === 'number') return Math.round(raw)
	const resolved = await instance.parseVariablesInString(String(raw ?? ''))
	return parseInt(resolved, 10)
}

/**
 * Resolve a variable-aware string option.
 */
export async function parseVariableString(
	instance: InstanceBaseExt<any>,
	action: { options: { [key: string]: any } },
	key: string,
): Promise<string> {
	const raw = action.options[key]
	return await instance.parseVariablesInString(String(raw ?? ''))
}

export interface MediaLayer {
	elapsedTime: any
	duration: any
	mediaIndex: any
}

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig
	OSC: any

	currentColumnIndex: any
	currentColumnName: any
	previousColumnName: any
	nextColumnName: any
	mediaLayers: { [id: string]: MediaLayer }

	initVariables(): void
	updateVariablesValues(): void
	receiveOSCResponse(data: OSCResponse): void
}
