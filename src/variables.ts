import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import { MilluminConfig } from './config'
import type { ElementState, MilluminState } from './state'
import { InstanceBaseExt, formatSecondsToHHMMSS, formatSecondsToMMSS, sanitizeId } from './utils'

const PROPERTY_VARS: { prop: string; label: string; kinds?: string[] }[] = [
	{ prop: 'opacity', label: 'Opacity' },
	{ prop: 'x', label: 'Position X' },
	{ prop: 'y', label: 'Position Y' },
	{ prop: 'rotation', label: 'Rotation' },
	{ prop: 'scale', label: 'Scale' },
	{ prop: 'intensity', label: 'Intensity' },
]

interface AutoElement {
	id: string
	label: string
	target: string
}

/** Elements (layers / lights / index) for which automatic variables are created */
function autoElements(instance: InstanceBaseExt<MilluminConfig>): AutoElement[] {
	const list: AutoElement[] = [
		{ id: 'selectedLayer', label: 'Selected layer', target: 'selectedLayer' },
		{ id: 'selectedLight', label: 'Selected light', target: 'selectedLight' },
	]
	if (instance.config.autoVariables === false) return list
	const seen = new Set(list.map((e) => e.id.toLowerCase()))
	for (const el of instance.state.elements.values()) {
		if (el.kind === 'selectedLayer' || el.kind === 'selectedLight') continue
		const id = sanitizeId(el.target.replace(':', '_'))
		if (seen.has(id.toLowerCase())) continue
		seen.add(id.toLowerCase())
		list.push({ id, label: el.target, target: el.target })
	}
	return list
}

function mediaValues(
	prefix: string,
	el: ElementState | undefined,
	out: CompanionVariableValues,
	legacy: boolean,
): void {
	const m = el?.media
	const elapsed = m?.time ?? 0
	const duration = m?.duration ?? 0
	const remaining = duration > 0 ? Math.max(0, duration - elapsed) : 0
	const progress = duration > 0 ? elapsed / duration : 0
	const E = legacy ? 'elapsedTime' : 'elapsed'
	const R = legacy ? 'remainingTime' : 'remaining'
	out[`${prefix}_${E}`] = elapsed
	out[`${prefix}_${E}_HHMMSS`] = formatSecondsToHHMMSS(elapsed)
	out[`${prefix}_${E}_MMSS`] = formatSecondsToMMSS(elapsed)
	out[`${prefix}_duration`] = duration
	out[`${prefix}_duration_HHMMSS`] = formatSecondsToHHMMSS(duration)
	out[`${prefix}_${R}`] = remaining
	out[`${prefix}_${R}_HHMMSS`] = formatSecondsToHHMMSS(remaining)
	out[`${prefix}_${R}_MMSS`] = formatSecondsToMMSS(remaining)
	out[`${prefix}_progress`] = progress
	out[`${prefix}_progressPercent`] = Math.round(progress * 100)
	out[`${prefix}_name`] = m?.name ?? ''
	out[`${prefix}_index`] = m?.index ?? 0
	out[`${prefix}_status`] = m?.status ?? 'stopped'
	out[`${prefix}_speed`] = m?.speed ?? 1
}

function mediaDefinitions(prefix: string, label: string, legacy: boolean): CompanionVariableDefinition[] {
	const E = legacy ? 'elapsedTime' : 'elapsed'
	const R = legacy ? 'remainingTime' : 'remaining'
	return [
		{ variableId: `${prefix}_${E}`, name: `${label} / Media / Elapsed Time (s)` },
		{ variableId: `${prefix}_${E}_HHMMSS`, name: `${label} / Media / Elapsed Time (HH:MM:SS)` },
		{ variableId: `${prefix}_${E}_MMSS`, name: `${label} / Media / Elapsed Time (MM:SS)` },
		{ variableId: `${prefix}_duration`, name: `${label} / Media / Duration (s)` },
		{ variableId: `${prefix}_duration_HHMMSS`, name: `${label} / Media / Duration (HH:MM:SS)` },
		{ variableId: `${prefix}_${R}`, name: `${label} / Media / Remaining Time (s)` },
		{ variableId: `${prefix}_${R}_HHMMSS`, name: `${label} / Media / Remaining Time (HH:MM:SS)` },
		{ variableId: `${prefix}_${R}_MMSS`, name: `${label} / Media / Remaining Time (MM:SS)` },
		{ variableId: `${prefix}_progress`, name: `${label} / Media / Progress (0-1)` },
		{ variableId: `${prefix}_progressPercent`, name: `${label} / Media / Progress (%)` },
		{ variableId: `${prefix}_name`, name: `${label} / Media / Name` },
		{ variableId: `${prefix}_index`, name: `${label} / Media / Column index` },
		{ variableId: `${prefix}_status`, name: `${label} / Media / Status (playing, paused, stopped)` },
		{ variableId: `${prefix}_speed`, name: `${label} / Media / Speed` },
	]
}

function elementValues(state: MilluminState, e: AutoElement, out: CompanionVariableValues): void {
	const el = state.getElement(e.target)
	for (const p of PROPERTY_VARS) {
		const v = state.getProperty(el, p.prop)
		out[`${e.id}_${p.prop}`] = v === undefined ? '' : v
	}
	out[`${e.id}_selected`] = el?.selected ? 1 : 0
	mediaValues(`${e.id}_media`, el, out, false)
}

export function getVariableDefinitions(instance: InstanceBaseExt<MilluminConfig>): CompanionVariableDefinition[] {
	const defs: CompanionVariableDefinition[] = [
		{ name: 'Current Column Index', variableId: 'currentColumnIndex' },
		{ name: 'Current Column Name', variableId: 'currentColumnName' },
		{ name: 'Previous Column Name', variableId: 'previousColumnName' },
		{ name: 'Next Column Name', variableId: 'nextColumnName' },
		{ name: 'Last Stopped Column Index', variableId: 'lastStoppedColumnIndex' },
		{ name: 'Last Stopped Column Name', variableId: 'lastStoppedColumnName' },
		{ name: 'Launched Columns (comma separated indexes)', variableId: 'launchedColumns' },
		{ name: 'Selected Layer Name', variableId: 'selectedLayer' },
		{ name: 'Selected Light Name', variableId: 'selectedLight' },
		{ name: 'Selected Element Index', variableId: 'selectedIndex' },
		{ name: 'Seconds since last feedback from Millumin', variableId: 'lastFeedbackAge' },
	]

	// Tracked time layers (legacy variable names kept for compatibility)
	for (const layer of instance.trackedLayers()) {
		defs.push(...mediaDefinitions(`media_${layer.id}`, `${layer.label} / Time Layer`, true))
	}

	for (const e of autoElements(instance)) {
		for (const p of PROPERTY_VARS) defs.push({ variableId: `${e.id}_${p.prop}`, name: `${e.label} / ${p.label}` })
		defs.push({ variableId: `${e.id}_selected`, name: `${e.label} / Selected (1/0)` })
		defs.push(...mediaDefinitions(`${e.id}_media`, e.label, false))
	}
	return defs
}

export function getVariableValues(instance: InstanceBaseExt<MilluminConfig>): CompanionVariableValues {
	const state = instance.state
	const v: CompanionVariableValues = {}
	v['currentColumnIndex'] = state.currentColumnIndex
	v['currentColumnName'] = state.currentColumnName
	v['previousColumnName'] = state.previousColumnName
	v['nextColumnName'] = state.nextColumnName
	v['lastStoppedColumnIndex'] = state.lastStoppedColumnIndex
	v['lastStoppedColumnName'] = state.lastStoppedColumnName
	v['launchedColumns'] = state.launchedColumnList()
	v['selectedLayer'] = state.selectedLayer
	v['selectedLight'] = state.selectedLight
	v['selectedIndex'] = state.selectedIndex
	v['lastFeedbackAge'] = state.lastMessageTime ? Math.round((Date.now() - state.lastMessageTime) / 1000) : -1

	for (const layer of instance.trackedLayers()) {
		mediaValues(`media_${layer.id}`, state.getElement(layer.target), v, true)
	}
	for (const e of autoElements(instance)) elementValues(state, e, v)
	return v
}

const signatures = new WeakMap<object, string>()

export function initVariables(instance: InstanceBaseExt<MilluminConfig>, force = false): void {
	const defs = getVariableDefinitions(instance)
	const signature = defs.map((d) => d.variableId).join('|')
	if (!force && signature === signatures.get(instance)) return
	signatures.set(instance, signature)
	instance.setVariableDefinitions(defs)
}

export function updateVariables(instance: InstanceBaseExt<MilluminConfig>): void {
	instance.setVariableValues(getVariableValues(instance))
}
