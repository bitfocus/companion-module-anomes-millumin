import {CompanionVariableDefinition, CompanionVariableValues} from '@companion-module/base'
import { MilluminConfig } from './config'
import { InstanceBaseExt } from './utils'

/**
 * Format seconds into MM:SS or H:MM:SS timecode string.
 */
function secondsToTimecode(totalSeconds: number): string {
	const negative = totalSeconds < 0
	const abs = Math.abs(totalSeconds)
	const h = Math.floor(abs / 3600)
	const m = Math.floor((abs % 3600) / 60)
	const s = Math.floor(abs % 60)
	const prefix = negative ? '-' : ''
	if (h > 0) {
		return `${prefix}${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
	}
	return `${prefix}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function updateVariables(instance: InstanceBaseExt<MilluminConfig>): void {
	const variables: CompanionVariableValues = {}
	variables['currentColumnIndex'] = instance.currentColumnIndex
	variables['currentColumnName'] = instance.currentColumnName
	variables['previousColumnName'] = instance.previousColumnName
	variables['nextColumnName'] = instance.nextColumnName
	for (const mediaLayerName in instance.mediaLayers) {
		const mediaLayer = instance.mediaLayers[mediaLayerName]
		const remaining = 0 < mediaLayer.duration ? mediaLayer.duration - mediaLayer.elapsedTime : 0
		const progress = 0 < mediaLayer.duration ? mediaLayer.elapsedTime / mediaLayer.duration : 0

		// Raw seconds (kept for backwards compatibility)
		variables[`media_${mediaLayerName}_elapsedTime`] = mediaLayer.elapsedTime
		variables[`media_${mediaLayerName}_duration`] = mediaLayer.duration
		variables[`media_${mediaLayerName}_remainingTime`] = remaining
		variables[`media_${mediaLayerName}_progress`] = progress

		// Pre-formatted timecodes (MM:SS or H:MM:SS)
		variables[`media_${mediaLayerName}_elapsed_tc`] = secondsToTimecode(mediaLayer.elapsedTime)
		variables[`media_${mediaLayerName}_duration_tc`] = secondsToTimecode(mediaLayer.duration)
		variables[`media_${mediaLayerName}_remaining_tc`] = secondsToTimecode(remaining)

		// Remaining as rounded integer seconds
		variables[`media_${mediaLayerName}_remaining_seconds`] = Math.round(remaining).toString()
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
		// Raw values (backwards compatible)
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Elapsed Time`, variableId: `media_${mediaLayerName}_elapsedTime` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Duration`, variableId: `media_${mediaLayerName}_duration` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Remaining Time`, variableId: `media_${mediaLayerName}_remainingTime` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Progress`, variableId: `media_${mediaLayerName}_progress` })
		// Formatted timecodes
		globalSettings.add({ name: `${mediaLayerName} / Elapsed (MM:SS)`, variableId: `media_${mediaLayerName}_elapsed_tc` })
		globalSettings.add({ name: `${mediaLayerName} / Duration (MM:SS)`, variableId: `media_${mediaLayerName}_duration_tc` })
		globalSettings.add({ name: `${mediaLayerName} / Remaining (MM:SS)`, variableId: `media_${mediaLayerName}_remaining_tc` })
		// Remaining integer seconds
		globalSettings.add({ name: `${mediaLayerName} / Remaining (seconds)`, variableId: `media_${mediaLayerName}_remaining_seconds` })
	}
	const filteredVariables = [...globalSettings]
	instance.setVariableDefinitions(filteredVariables)
}
