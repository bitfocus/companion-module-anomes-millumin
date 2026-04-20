import { CompanionInputFieldNumber, CompanionInputFieldTextInput, InstanceBase, InstanceTypes } from '@companion-module/base'
import { MilluminConfig } from './config.js'
import { OSC as OSC_Class, OSCResponse } from './osc.js'

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

export const layerTargetOptions = [
	{
		type: 'dropdown' as const,
		label: 'Layer Target',
		id: 'layerTarget',
		default: 'selected',
		disableAutoExpression: true,
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
		isVisibleExpression: '$(options:layerTarget) == "custom"',
	},
]

export function resolveLayerPath(
	_instance: InstanceBaseExt,
	action: { options: { [key: string]: any } },
): string {
	if (action.options.layerTarget === 'custom') {
		return String(action.options.customLayerName ?? '')
	}
	return 'selectedLayer'
}

export function parseOptionNumber(
	action: { options: { [key: string]: any } },
	key: string,
): number {
	const raw = action.options[key]
	if (typeof raw === 'number') return raw
	return parseFloat(String(raw ?? ''))
}

export function parseOptionInt(
	action: { options: { [key: string]: any } },
	key: string,
): number {
	const raw = action.options[key]
	if (typeof raw === 'number') return Math.round(raw)
	return parseInt(String(raw ?? ''), 10)
}

export function getOptionString(
	action: { options: { [key: string]: any } },
	key: string,
): string {
	return String(action.options[key] ?? '')
}

export interface MediaLayer {
	elapsedTime: number
	duration: number
	mediaIndex: number
	lastUpdate: number
}

// API 2.0: InstanceBase takes InstanceTypes, not just config
export interface MilluminTypes extends InstanceTypes {
	config: MilluminConfig
}

export interface InstanceBaseExt extends InstanceBase<MilluminTypes> {
	config: MilluminConfig
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
