import { CompanionVariableValues } from '@companion-module/base'
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

export function updateVariables(instance: InstanceBaseExt): void {
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

export function initVariables(instance: InstanceBaseExt): void {
	// API 2.0: setVariableDefinitions takes an object, not an array
	const varDefs: Record<string, { name: string }> = {
		currentColumnIndex: { name: 'Current Column Index' },
		currentColumnName: { name: 'Current Column Name' },
		previousColumnName: { name: 'Previous Column Name' },
		nextColumnName: { name: 'Next Column Name' },
	}

	for (const mediaLayerName in instance.mediaLayers) {
		const safeName = sanitizeLayerName(mediaLayerName)
		// Raw values (backwards compatible)
		varDefs[`media_${safeName}_elapsedTime`] = { name: `${mediaLayerName} / Time Layer / Elapsed Time` }
		varDefs[`media_${safeName}_duration`] = { name: `${mediaLayerName} / Time Layer / Duration` }
		varDefs[`media_${safeName}_remainingTime`] = { name: `${mediaLayerName} / Time Layer / Remaining Time` }
		varDefs[`media_${safeName}_progress`] = { name: `${mediaLayerName} / Time Layer / Progress` }
		// Formatted timecodes
		varDefs[`media_${safeName}_elapsed_tc`] = { name: `${mediaLayerName} / Elapsed (MM:SS)` }
		varDefs[`media_${safeName}_duration_tc`] = { name: `${mediaLayerName} / Duration (MM:SS)` }
		varDefs[`media_${safeName}_remaining_tc`] = { name: `${mediaLayerName} / Remaining (MM:SS)` }
		// Remaining integer seconds
		varDefs[`media_${safeName}_remaining_seconds`] = { name: `${mediaLayerName} / Remaining (seconds)` }
	}

	instance.setVariableDefinitions(varDefs)
}
