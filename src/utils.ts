import { CompanionInputFieldNumber, CompanionInputFieldTextInput, InstanceBase } from '@companion-module/base'
import { MilluminConfig } from './config'
import { OSC as OSC_Class, OSCResponse } from './osc'

type EnforceDefault<T, U> = Omit<T, 'default'> & { default: U }

export interface Options {
	index: EnforceDefault<CompanionInputFieldNumber, number>
	indexVar: EnforceDefault<CompanionInputFieldTextInput, string>
	name: EnforceDefault<CompanionInputFieldTextInput, string>
	time: EnforceDefault<CompanionInputFieldNumber, number>
	timeVar: EnforceDefault<CompanionInputFieldTextInput, string>
	value: EnforceDefault<CompanionInputFieldNumber, number>
	valueVar: EnforceDefault<CompanionInputFieldTextInput, string>
	oscPath: EnforceDefault<CompanionInputFieldTextInput, string>
	oscArgs: EnforceDefault<CompanionInputFieldTextInput, string>
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
	oscPath: {
		type: 'textinput',
		label: 'OSC Path',
		id: 'oscPath',
		default: '/millumin/action/custom',
		useVariables: true,
		tooltip: 'Enter the OSC path (e.g., /millumin/action/custom)',
	},
	oscArgs: {
		type: 'textinput',
		label: 'OSC Arguments',
		id: 'oscArgs',
		default: '',
		useVariables: true,
		tooltip: 'Optional: comma-separated values with type prefix (e.g., i:1,s:hello,f:0.5). Without prefix, type is auto-detected.',
	},
}

/**
 * Common option fields for layer targeting (Selected Layer vs custom layer name).
 * Prepend these to any action that sends to /selectedLayer/*.
 */
export const layerTargetOptions = [
	{
		type: 'dropdown' as const,
		label: 'Layer Target',
		id: 'layerTarget',
		default: 'selected',
		choices: [
			{ id: 'selected', label: 'Selected Layer' },
			{ id: 'custom', label: 'Layer Name' },
		],
	},
	{
		type: 'textinput' as const,
		label: 'Layer Name',
		id: 'customLayerName',
		default: '',
		useVariables: true,
		isVisible: (opts: any) => opts.layerTarget === 'custom',
	},
]

/**
 * Resolve the OSC layer path prefix based on layerTarget option.
 * Returns 'selectedLayer' or the custom layer name.
 */
export async function resolveLayerPath(
	instance: InstanceBaseExt<MilluminConfig>,
	action: { options: { [key: string]: any } },
): Promise<string> {
	if (action.options.layerTarget === 'custom') {
		return await instance.parseVariablesInString(String(action.options.customLayerName ?? ''))
	}
	return 'selectedLayer'
}

/**
 * Parse a variable-aware option value as a float.
 * Returns the parsed number, or NaN if invalid.
 */
export async function parseVariableNumber(
	instance: InstanceBaseExt<MilluminConfig>,
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
	instance: InstanceBaseExt<MilluminConfig>,
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
	instance: InstanceBaseExt<MilluminConfig>,
	action: { options: { [key: string]: any } },
	key: string,
): Promise<string> {
	const raw = action.options[key]
	return await instance.parseVariablesInString(String(raw ?? ''))
}

export interface MediaLayer {
	elapsedTime: number
	duration: number
	mediaIndex: number
}

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig
	OSC: OSC_Class | null

	currentColumnIndex: number
	currentColumnName: string | null
	previousColumnName: string | null
	nextColumnName: string | null
	mediaLayers: { [id: string]: MediaLayer }

	initVariables(): void
	updateVariablesValues(): void
	receiveOSCResponse(data: OSCResponse): void
}
