import {
	CompanionCommonCallbackContext,
	CompanionInputFieldDropdown,
	CompanionInputFieldNumber,
	CompanionInputFieldTextInput,
	CompanionOptionValues,
	InstanceBase,
	OSCSomeArguments,
	SomeCompanionActionInputField,
} from '@companion-module/base'
import { OSCResponse } from './osc'
import type { MilluminState } from './state'

type EnforceDefault<T, U> = Omit<T, 'default'> & { default: U }

export interface Options {
	index: EnforceDefault<CompanionInputFieldNumber, number>
	name: EnforceDefault<CompanionInputFieldTextInput, string>
	time: EnforceDefault<CompanionInputFieldNumber, number>
	value: EnforceDefault<CompanionInputFieldNumber, number>
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
	name: {
		type: 'textinput',
		label: 'Name',
		id: 'name',
		default: '',
		useVariables: true,
	},
	time: {
		type: 'number',
		label: 'Time (seconds, negative = from the end)',
		id: 'time',
		default: 0,
		min: -65535,
		max: 65535,
	},
	value: {
		type: 'number',
		label: 'Value',
		id: 'value',
		default: 0,
		min: -65535,
		max: 65535,
		step: 0.01,
	},
	oscPath: {
		type: 'textinput',
		label: 'OSC Path',
		id: 'oscPath',
		default: '/millumin/action/custom',
		tooltip: 'Enter the OSC path (e.g., /millumin/action/custom)',
		useVariables: true,
	},
	oscArgs: {
		type: 'textinput',
		label: 'OSC Arguments',
		id: 'oscArgs',
		default: '',
		tooltip:
			'Optional comma separated arguments. Prefix with a type to force it: i:1, f:0.5, s:hello. Without prefix the type is inferred.',
		useVariables: true,
	},
}

/* ------------------------------------------------------------------------ */
/* Conditional visibility                                                    */
/* ------------------------------------------------------------------------ */

/**
 * Show a field only when another field (dropdown) has one of the given values.
 * Provides both the modern expression and the legacy function (older Companion versions).
 */
export function showWhen(
	field: string,
	values: string[],
): Pick<SomeCompanionActionInputField, 'isVisibleExpression' | 'isVisible' | 'isVisibleData'> {
	return {
		isVisibleExpression: values.map((v) => `$(options:${field}) == '${v}'`).join(' || '),
		isVisibleData: { field, values },
		isVisible: (opts: CompanionOptionValues, data: any): boolean => data.values.includes(opts[data.field]),
	}
}

/* ------------------------------------------------------------------------ */
/* Targets (elements / media)                                                */
/* ------------------------------------------------------------------------ */

export type TargetType = 'selectedLayer' | 'selectedLight' | 'layer' | 'light' | 'index' | 'element' | 'media'

export const LAYER_TARGET_CHOICES = [
	{ id: 'selectedLayer', label: 'Selected layer' },
	{ id: 'layer', label: 'Layer by name (layer:Name)' },
	{ id: 'index', label: 'Element by index (index:N)' },
	{ id: 'element', label: 'Element by name (layer or light)' },
]
export const LIGHT_TARGET_CHOICES = [
	{ id: 'selectedLight', label: 'Selected light' },
	{ id: 'light', label: 'Light by name (light:Name)' },
	{ id: 'index', label: 'Element by index (index:N)' },
	{ id: 'element', label: 'Element by name (layer or light)' },
]
export const ELEMENT_TARGET_CHOICES = [
	{ id: 'selectedLayer', label: 'Selected layer' },
	{ id: 'selectedLight', label: 'Selected light' },
	{ id: 'layer', label: 'Layer by name (layer:Name)' },
	{ id: 'light', label: 'Light by name (light:Name)' },
	{ id: 'index', label: 'Element by index (index:N)' },
	{ id: 'element', label: 'Element by name (layer or light)' },
]
export const MEDIA_TARGET_CHOICES = [...LAYER_TARGET_CHOICES, { id: 'media', label: 'Media by name (e.g. Movie.mov)' }]

/** Build the "target" option fields (type + name + index) */
export function targetFields(
	choices: { id: string; label: string }[],
	defaultType: TargetType = 'selectedLayer',
	label = 'Target',
): SomeCompanionActionInputField[] {
	const named = choices.map((c) => c.id).filter((id) => ['layer', 'light', 'element', 'media'].includes(id))
	const dropdown: CompanionInputFieldDropdown = {
		type: 'dropdown',
		id: 'targetType',
		label,
		default: defaultType,
		choices,
	}
	return [
		dropdown,
		{
			type: 'textinput',
			id: 'targetName',
			label: 'Name',
			default: '',
			useVariables: true,
			...showWhen('targetType', named),
		},
		{
			type: 'textinput',
			id: 'targetIndex',
			label: 'Index',
			default: '1',
			useVariables: true,
			...showWhen('targetType', ['index']),
		},
	]
}

export async function parseText(context: CompanionCommonCallbackContext, value: unknown): Promise<string> {
	if (value === undefined || value === null) return ''
	const str = String(value)
	if (!str.includes('$(')) return str
	return context.parseVariablesInString(str)
}

export async function parseNumber(context: CompanionCommonCallbackContext, value: unknown): Promise<number | null> {
	if (typeof value === 'number') return value
	const str = (await parseText(context, value)).trim().replace(',', '.')
	if (str === '') return null
	const n = Number(str)
	return isNaN(n) ? null : n
}

/**
 * Resolve the target options into the OSC address segment, e.g. "selectedLayer", "layer:Video", "index:3", "Movie.mov"
 * Returns null if the target is invalid.
 */
export async function resolveTarget(
	context: CompanionCommonCallbackContext,
	opts: CompanionOptionValues,
): Promise<string | null> {
	const type = (opts.targetType as TargetType) || 'selectedLayer'
	switch (type) {
		case 'selectedLayer':
		case 'selectedLight':
			return type
		case 'index': {
			const idx = await parseNumber(context, opts.targetIndex)
			if (idx === null || idx < 1) return null
			return `index:${Math.round(idx)}`
		}
		case 'layer':
		case 'light': {
			const name = (await parseText(context, opts.targetName)).trim()
			if (name === '') return null
			return `${type}:${name}`
		}
		case 'element':
		case 'media': {
			const name = (await parseText(context, opts.targetName)).trim()
			if (name === '') return null
			return name
		}
	}
	return null
}

/** Normalise a target string to the key used in the state store (lower case, as Millumin is case insensitive) */
export function targetKey(target: string): string {
	return target.trim().toLowerCase()
}

/* ------------------------------------------------------------------------ */
/* Value modes (absolute / relative)                                         */
/* ------------------------------------------------------------------------ */

export const MODE_CHOICES = [
	{ id: 'set', label: 'Set (absolute)' },
	{ id: '+', label: 'Increase by (relative /+)' },
	{ id: '-', label: 'Decrease by (relative /-)' },
]

export const modeField: CompanionInputFieldDropdown = {
	type: 'dropdown',
	id: 'mode',
	label: 'Mode',
	default: 'set',
	choices: MODE_CHOICES,
}

export function withMode(address: string, mode: unknown): string {
	if (mode === '+' || mode === '-') return `${address}/${mode}`
	return address
}

/* ------------------------------------------------------------------------ */
/* OSC helpers                                                               */
/* ------------------------------------------------------------------------ */

export const f = (value: number): { type: 'f'; value: number } => ({ type: 'f', value })
export const i = (value: number): { type: 'i'; value: number } => ({ type: 'i', value: Math.round(value) })
export const s = (value: string): { type: 's'; value: string } => ({ type: 's', value })

/** Number if numeric, else string (timecode "01:02:03.456") */
export function timeArg(value: string): { type: 'f'; value: number } | { type: 's'; value: string } {
	const trimmed = value.trim()
	const n = Number(trimmed.replace(',', '.'))
	if (trimmed !== '' && !isNaN(n)) return f(n)
	return s(trimmed)
}

/** Parse a comma separated list of arguments, with optional type prefixes (i:, f:, s:) */
export function parseArgList(argsString: string, warn?: (msg: string) => void): OSCSomeArguments {
	const args: { type: string; value: any }[] = []
	if (!argsString || argsString.trim() === '') return args as OSCSomeArguments
	for (const part of argsString.split(',')) {
		const trimmed = part.trim()
		if (trimmed === '') continue
		const typed = /^([ifs]):(.*)$/i.exec(trimmed)
		if (typed) {
			const type = typed[1].toLowerCase()
			const valueStr = typed[2]
			if (type === 'i') args.push({ type: 'i', value: parseInt(valueStr, 10) })
			else if (type === 'f') args.push({ type: 'f', value: parseFloat(valueStr) })
			else args.push({ type: 's', value: valueStr })
		} else if (/^[a-z]:/i.test(trimmed) && warn) {
			warn(`Unknown OSC argument type in "${trimmed}", sent as string`)
			args.push({ type: 's', value: trimmed })
		} else if (!isNaN(Number(trimmed))) {
			if (trimmed.includes('.')) args.push({ type: 'f', value: parseFloat(trimmed) })
			else args.push({ type: 'i', value: parseInt(trimmed, 10) })
		} else {
			args.push({ type: 's', value: trimmed })
		}
	}
	return args as OSCSomeArguments
}

/* ------------------------------------------------------------------------ */
/* Formatting                                                                */
/* ------------------------------------------------------------------------ */

export function formatSecondsToHHMMSS(seconds: number): string {
	if (isNaN(seconds) || seconds < 0) return '00:00:00'
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const secs = Math.floor(seconds % 60)
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatSecondsToMMSS(seconds: number): string {
	if (isNaN(seconds) || seconds < 0) seconds = 0
	const minutes = Math.floor(seconds / 60)
	const secs = Math.floor(seconds % 60)
	return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/** Variable ids must only contain letters, digits, - and _ */
export function sanitizeId(name: string): string {
	return name.replace(/[^a-zA-Z0-9_-]/g, '_')
}

/* ------------------------------------------------------------------------ */
/* Instance interface                                                        */
/* ------------------------------------------------------------------------ */

export interface OSCSender {
	sendCommand(path: string, args?: OSCSomeArguments): void
}

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig
	OSC: OSCSender | null
	state: MilluminState

	/** Layers for which variables / timer presets are generated: id (variable-safe) -> target ("index:1", "layer:Video") */
	trackedLayers(): { id: string; label: string; target: string }[]

	initVariables(): void
	updateVariablesValues(): void
	receiveOSCResponse(data: OSCResponse): void
}
