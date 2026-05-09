import {CompanionVariableDefinition, CompanionVariableValues} from '@companion-module/base'
import { MilluminConfig } from './config'
import { InstanceBaseExt } from './utils'

/**
 * Format seconds into MM:SS or H:MM:SS timecode string.
 * Negative values are clamped to 00:00.
 * Hours are natural width (1:02:45 or 12:02:45).
 */
function secondsToTimecode(totalSeconds: number): string {
	if (totalSeconds < 0) totalSeconds = 0
	const h = Math.floor(totalSeconds / 3600)
	const m = Math.floor((totalSeconds % 3600) / 60)
	const s = Math.floor(totalSeconds % 60)
	if (h > 0) {
		return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
	}
	return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/**
 * Sanitize a layer name for use as a variable ID.
 * Replaces spaces with underscores so variable IDs are valid.
 */
function sanitizeLayerName(name: string): string {
	return name.replace(/\s+/g, '_')
}

export function updateVariables(instance: InstanceBaseExt<MilluminConfig>): void {
	const variables: CompanionVariableValues = {}
	variables['currentColumnIndex'] = instance.currentColumnIndex
	variables['currentColumnName'] = instance.currentColumnName ?? undefined
	variables['previousColumnName'] = instance.previousColumnName ?? undefined
	variables['nextColumnName'] = instance.nextColumnName ?? undefined
	for (const mediaLayerName in instance.mediaLayers) {
		const mediaLayer = instance.mediaLayers[mediaLayerName]
		const safeName = sanitizeLayerName(mediaLayerName)
		const remaining = 0 < mediaLayer.duration ? mediaLayer.duration - mediaLayer.elapsedTime : 0
		const progress = 0 < mediaLayer.duration ? mediaLayer.elapsedTime / mediaLayer.duration : 0

		// Raw seconds (kept for backwards compatibility)
		variables[`media_${safeName}_elapsedTime`] = mediaLayer.elapsedTime
		variables[`media_${safeName}_duration`] = mediaLayer.duration
		variables[`media_${safeName}_remainingTime`] = remaining
		variables[`media_${safeName}_progress`] = progress

		// Pre-formatted timecodes (MM:SS or H:MM:SS)
		variables[`media_${safeName}_elapsed_tc`] = secondsToTimecode(mediaLayer.elapsedTime)
		variables[`media_${safeName}_duration_tc`] = secondsToTimecode(mediaLayer.duration)
		variables[`media_${safeName}_remaining_tc`] = secondsToTimecode(remaining)

		// Remaining as rounded integer seconds
		variables[`media_${safeName}_remaining_seconds`] = Math.round(remaining).toString()
	}

	instance.setVariableValues(variables)
}

export function initVariables(instance: InstanceBaseExt<MilluminConfig>): void {
	const globalSettings: Set<CompanionVariableDefinition> = new Set([
		{ name: 'Current Column Index', variableId: 'currentColumnIndex' },
		{ name: 'Current Column Name', variableId: 'currentColumnName' },
		{ name: 'Previous Column Name', variableId: 'previousColumnName' },
		{ name: 'Next Column Name', variableId: 'nextColumnName' },
	])
	for (const mediaLayerName in instance.mediaLayers) {
		const safeName = sanitizeLayerName(mediaLayerName)
		// Raw values (backwards compatible)
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Elapsed Time`, variableId: `media_${safeName}_elapsedTime` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Duration`, variableId: `media_${safeName}_duration` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Remaining Time`, variableId: `media_${safeName}_remainingTime` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Progress`, variableId: `media_${safeName}_progress` })
		// Formatted timecodes
		globalSettings.add({ name: `${mediaLayerName} / Elapsed (MM:SS)`, variableId: `media_${safeName}_elapsed_tc` })
		globalSettings.add({ name: `${mediaLayerName} / Duration (MM:SS)`, variableId: `media_${safeName}_duration_tc` })
		globalSettings.add({ name: `${mediaLayerName} / Remaining (MM:SS)`, variableId: `media_${safeName}_remaining_tc` })
		// Remaining integer seconds
		globalSettings.add({ name: `${mediaLayerName} / Remaining (seconds)`, variableId: `media_${safeName}_remaining_seconds` })
	}
	const filteredVariables = [...globalSettings]
	instance.setVariableDefinitions(filteredVariables)
}
