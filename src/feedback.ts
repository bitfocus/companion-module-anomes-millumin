import {
	CompanionFeedbackDefinition,
	CompanionFeedbackDefinitions,
	DropdownChoice,
	SomeCompanionFeedbackInputField,
	combineRgb,
} from '@companion-module/base'
import { graphics } from 'companion-module-utils'
import { OptionsBar } from 'companion-module-utils/dist/graphics'
import { MilluminConfig } from './config'
import {
	ELEMENT_TARGET_CHOICES,
	InstanceBaseExt,
	LAYER_TARGET_CHOICES,
	parseNumber,
	parseText,
	resolveTarget,
	showWhen,
	targetFields,
} from './utils'

export enum FeedbackId {
	PROGRESS_BAR = 'progressBar',
	COLUMN_LAUNCHED = 'columnLaunched',
	MEDIA_STATUS = 'mediaStatus',
	ELEMENT_SELECTED = 'elementSelected',
	PROPERTY_COMPARE = 'propertyCompare',
	REMAINING_TIME = 'remainingTime',
	FEEDBACK_ALIVE = 'feedbackAlive',
}

export const Colors = {
	white: combineRgb(255, 255, 255),
	black: combineRgb(0, 0, 0),
	green: combineRgb(0, 204, 0),
	darkGreen: combineRgb(0, 102, 0),
	yellow: combineRgb(255, 255, 0),
	orange: combineRgb(255, 140, 0),
	red: combineRgb(204, 0, 0),
	darkRed: combineRgb(102, 0, 0),
	blue: combineRgb(0, 80, 200),
	darkBlue: combineRgb(0, 30, 90),
	grey: combineRgb(60, 60, 60),
	purple: combineRgb(120, 40, 160),
	milluminOrange: combineRgb(230, 120, 20),
}

const PROPERTY_CHOICES: DropdownChoice[] = [
	{ id: 'opacity', label: 'Opacity' },
	{ id: 'x', label: 'Position X' },
	{ id: 'y', label: 'Position Y' },
	{ id: 'rotation', label: 'Rotation' },
	{ id: 'scale', label: 'Scale' },
	{ id: 'intensity', label: 'Light intensity' },
	{ id: 'media/time', label: 'Media elapsed time (s)' },
	{ id: 'media/remaining', label: 'Media remaining time (s)' },
	{ id: 'media/duration', label: 'Media duration (s)' },
	{ id: 'media/normalizedTime', label: 'Media progress (0-1)' },
	{ id: 'media/speed', label: 'Media speed' },
	{ id: 'media/index', label: 'Media column index' },
	{ id: 'media/name', label: 'Media name' },
	{ id: 'mapping/topLeft/x', label: 'Mapping top-left X' },
	{ id: 'mapping/topLeft/y', label: 'Mapping top-left Y' },
	{ id: 'mapping/topRight/x', label: 'Mapping top-right X' },
	{ id: 'mapping/topRight/y', label: 'Mapping top-right Y' },
	{ id: 'mapping/bottomRight/x', label: 'Mapping bottom-right X' },
	{ id: 'mapping/bottomRight/y', label: 'Mapping bottom-right Y' },
	{ id: 'mapping/bottomLeft/x', label: 'Mapping bottom-left X' },
	{ id: 'mapping/bottomLeft/y', label: 'Mapping bottom-left Y' },
]

const OPERATOR_CHOICES: DropdownChoice[] = [
	{ id: 'eq', label: '=' },
	{ id: 'ne', label: '≠' },
	{ id: 'gt', label: '>' },
	{ id: 'gte', label: '≥' },
	{ id: 'lt', label: '<' },
	{ id: 'lte', label: '≤' },
]

function compare(a: number | string, op: string, b: number | string): boolean {
	if (typeof a === 'number' && typeof b === 'number') {
		const eps = 1e-6
		switch (op) {
			case 'eq':
				return Math.abs(a - b) < eps
			case 'ne':
				return Math.abs(a - b) >= eps
			case 'gt':
				return a > b
			case 'gte':
				return a >= b - eps
			case 'lt':
				return a < b
			case 'lte':
				return a <= b + eps
		}
		return false
	}
	const sa = String(a).toLowerCase()
	const sb = String(b).toLowerCase()
	if (op === 'eq') return sa === sb
	if (op === 'ne') return sa !== sb
	return false
}

export function getFeedbacks(instance: InstanceBaseExt<MilluminConfig>): CompanionFeedbackDefinitions {
	const trackedLayers: DropdownChoice[] = instance.trackedLayers().map((l) => ({ id: l.id, label: l.label }))

	const layerTarget = targetFields(LAYER_TARGET_CHOICES) as SomeCompanionFeedbackInputField[]
	const elementTarget = targetFields(ELEMENT_TARGET_CHOICES) as SomeCompanionFeedbackInputField[]

	const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {
		[FeedbackId.PROGRESS_BAR]: {
			type: 'advanced',
			name: 'Media on Layer / Progress Bar',
			description: 'Show a progress bar of media currently playing on layer',
			options: [
				{
					id: 'layer',
					type: 'dropdown',
					choices: trackedLayers,
					label: 'Layer (tracked layer, or type a target such as layer:Name, index:2, selectedLayer)',
					default: 'firstByIndex',
					allowCustom: true,
				},
				{
					id: 'hideWhenNotRunning',
					type: 'checkbox',
					label: 'Hide when not running',
					default: true,
				},
				{
					id: 'expiringInSeconds',
					type: 'number',
					label: 'Change to expiring color at remaining seconds',
					default: 15,
					min: 0,
					max: 1000,
				},
				{
					type: 'colorpicker',
					label: 'Running color',
					id: 'runningColor',
					default: Colors.green,
				},
				{
					type: 'colorpicker',
					label: 'Expiring color',
					id: 'expiringColor',
					default: Colors.yellow,
				},
			],
			callback: async (feedback, ctx) => {
				const layerOpt = await parseText(ctx, feedback.options.layer ?? 'firstByIndex')
				const tracked = instance.trackedLayers().find((l) => l.id === layerOpt)
				const el = instance.state.getElement(tracked ? tracked.target : layerOpt)
				const duration = el?.media.duration ?? 0
				const elapsed = el?.media.time ?? 0

				if (duration === 0 && (feedback.options.hideWhenNotRunning || !el)) return {}
				if (!feedback.image) return {}

				const remaining = duration - elapsed
				const isExpiring = remaining < Number(feedback.options.expiringInSeconds ?? 0)
				const color = Number(isExpiring ? feedback.options.expiringColor : feedback.options.runningColor)
				const options: OptionsBar = {
					width: feedback.image.width,
					height: feedback.image.height,
					colors: [{ size: 100, color, background: color, backgroundOpacity: 64 }],
					barLength: feedback.image.width - 10,
					barWidth: 8,
					value: duration > 0 ? 100 - (100 / duration) * elapsed : 0,
					type: 'horizontal',
					offsetX: 5,
					offsetY: feedback.image.height > 58 ? feedback.image.height - 10 : 48,
					opacity: 255,
				}
				return { imageBuffer: graphics.bar(options) }
			},
		},

		[FeedbackId.COLUMN_LAUNCHED]: {
			type: 'boolean',
			name: 'Column / Is launched',
			description: 'True when the column (by index or name) is the launched one',
			defaultStyle: { bgcolor: Colors.green, color: Colors.black },
			options: [
				{
					type: 'dropdown',
					id: 'by',
					label: 'Identify column by',
					default: 'index',
					choices: [
						{ id: 'index', label: 'Index' },
						{ id: 'name', label: 'Name' },
					],
				},
				{
					type: 'textinput',
					id: 'index',
					label: 'Index',
					default: '1',
					useVariables: true,
					...showWhen('by', ['index']),
				},
				{ type: 'textinput', id: 'name', label: 'Name', default: '', useVariables: true, ...showWhen('by', ['name']) },
			],
			callback: async (feedback, ctx) => {
				const st = instance.state
				if (feedback.options.by === 'name') {
					const name = (await parseText(ctx, feedback.options.name)).trim().toLowerCase()
					if (name === '') return false
					return [...st.launchedColumns.values()].some((n) => n.toLowerCase() === name)
				}
				const idx = await parseNumber(ctx, feedback.options.index)
				if (idx === null) return false
				return st.launchedColumns.has(Math.round(idx))
			},
		},

		[FeedbackId.MEDIA_STATUS]: {
			type: 'boolean',
			name: 'Media / Status on layer',
			description: 'Playing / paused / stopped, optionally for a specific media name or column',
			defaultStyle: { bgcolor: Colors.green, color: Colors.black },
			options: [
				...layerTarget,
				{
					type: 'dropdown',
					id: 'status',
					label: 'Status',
					default: 'playing',
					choices: [
						{ id: 'playing', label: 'Playing' },
						{ id: 'paused', label: 'Paused' },
						{ id: 'stopped', label: 'Stopped' },
						{ id: 'active', label: 'Playing or paused (loaded)' },
					],
				},
				{
					type: 'textinput',
					id: 'media',
					label: 'Only for media name or column index (empty = any)',
					default: '',
					useVariables: true,
				},
			],
			callback: async (feedback, ctx) => {
				const t = await resolveTarget(ctx, feedback.options)
				if (t === null) return false
				const el = instance.state.getElement(t)
				const status = el?.media.status ?? 'stopped'
				const wanted = feedback.options.status
				const statusOk = wanted === 'active' ? status === 'playing' || status === 'paused' : status === wanted
				if (!statusOk) return false
				const filter = (await parseText(ctx, feedback.options.media)).trim()
				if (filter === '' || !el) return true
				const n = Number(filter)
				if (!isNaN(n)) return el.media.index === n
				return el.media.name.toLowerCase() === filter.toLowerCase()
			},
		},

		[FeedbackId.ELEMENT_SELECTED]: {
			type: 'boolean',
			name: 'Layer / Light / Is selected',
			defaultStyle: { bgcolor: Colors.milluminOrange, color: Colors.black },
			options: targetFields(
				ELEMENT_TARGET_CHOICES.filter((c) => !c.id.startsWith('selected')),
				'layer',
			) as SomeCompanionFeedbackInputField[],
			callback: async (feedback, ctx) => {
				const t = await resolveTarget(ctx, feedback.options)
				if (t === null) return false
				const st = instance.state
				const el = st.getElement(t)
				if (el) return el.selected
				// Fallback on the selection names
				const lower = t.toLowerCase()
				if (lower.startsWith('layer:')) return st.selectedLayer.toLowerCase() === lower.substring(6)
				if (lower.startsWith('light:')) return st.selectedLight.toLowerCase() === lower.substring(6)
				if (lower.startsWith('index:')) return st.selectedIndex === Number(lower.substring(6))
				return st.selectedLayer.toLowerCase() === lower || st.selectedLight.toLowerCase() === lower
			},
		},

		[FeedbackId.PROPERTY_COMPARE]: {
			type: 'boolean',
			name: 'Layer / Light / Property value',
			description: 'Compare a property reported by Millumin (opacity, position, intensity, media time...)',
			defaultStyle: { bgcolor: Colors.blue, color: Colors.white },
			options: [
				...elementTarget,
				{
					type: 'dropdown',
					id: 'property',
					label: 'Property',
					default: 'opacity',
					allowCustom: true,
					choices: PROPERTY_CHOICES,
				},
				{ type: 'dropdown', id: 'operator', label: 'Operator', default: 'gt', choices: OPERATOR_CHOICES },
				{ type: 'textinput', id: 'value', label: 'Value', default: '0', useVariables: true },
			],
			callback: async (feedback, ctx) => {
				const t = await resolveTarget(ctx, feedback.options)
				if (t === null) return false
				const st = instance.state
				const current = st.getProperty(st.getElement(t), String(feedback.options.property ?? ''))
				if (current === undefined) return false
				const raw = (await parseText(ctx, feedback.options.value)).trim()
				const n = Number(raw.replace(',', '.'))
				const ref: number | string = raw !== '' && !isNaN(n) ? n : raw
				const cur: number | string = typeof current === 'number' || isNaN(Number(current)) ? current : Number(current)
				return compare(cur, String(feedback.options.operator ?? 'eq'), ref)
			},
		},

		[FeedbackId.REMAINING_TIME]: {
			type: 'boolean',
			name: 'Media / Remaining time below',
			description: 'True when the media of the layer has less than N seconds left',
			defaultStyle: { bgcolor: Colors.red, color: Colors.white },
			options: [
				...layerTarget,
				{ type: 'number', id: 'seconds', label: 'Seconds', default: 10, min: 0, max: 86400 },
				{ type: 'checkbox', id: 'onlyPlaying', label: 'Only while playing', default: true },
			],
			callback: async (feedback, ctx) => {
				const t = await resolveTarget(ctx, feedback.options)
				if (t === null) return false
				const el = instance.state.getElement(t)
				if (!el || el.media.duration <= 0) return false
				if (feedback.options.onlyPlaying && el.media.status !== 'playing') return false
				return el.media.duration - el.media.time <= Number(feedback.options.seconds ?? 0)
			},
		},

		[FeedbackId.FEEDBACK_ALIVE]: {
			type: 'boolean',
			name: 'Connection / Feedback received recently',
			description:
				'True if Millumin sent feedback during the last N seconds (needs "API feedback" enabled in Millumin)',
			defaultStyle: { bgcolor: Colors.darkGreen, color: Colors.white },
			options: [{ type: 'number', id: 'seconds', label: 'Within seconds', default: 10, min: 1, max: 3600 }],
			callback: (feedback) => {
				const last = instance.state.lastMessageTime
				return last > 0 && Date.now() - last <= Number(feedback.options.seconds ?? 10) * 1000
			},
		},
	}
	return feedbacks
}
