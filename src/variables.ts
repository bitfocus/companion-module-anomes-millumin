import {CompanionVariableDefinition, CompanionVariableValues} from '@companion-module/base'
import { MilluminConfig } from './config'
import { InstanceBaseExt } from './utils'

export function updateVariables(instance: InstanceBaseExt<MilluminConfig>): void {
	const variables: CompanionVariableValues = {}
	variables['currentColumnIndex'] = instance.currentColumnIndex
	variables['currentColumnName'] = instance.currentColumnName
	variables['previousColumnName'] = instance.previousColumnName
	variables['nextColumnName'] = instance.nextColumnName
	for (const mediaLayerName in instance.mediaLayers) {
		const mediaLayer = instance.mediaLayers[mediaLayerName]
		variables[`media_${mediaLayerName}_elapsedTime`] = mediaLayer.elapsedTime
		variables[`media_${mediaLayerName}_duration`] = mediaLayer.duration
		if (0 < mediaLayer.duration) {
			variables[`media_${mediaLayerName}_remainingTime`] = mediaLayer.duration - mediaLayer.elapsedTime
			variables[`media_${mediaLayerName}_progress`] = mediaLayer.elapsedTime / mediaLayer.duration
		} else {
			variables[`media_${mediaLayerName}_remainingTime`] = 0
			variables[`media_${mediaLayerName}_progress`] = 0
		}
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
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Elapsed Time`, variableId: `media_${mediaLayerName}_elapsedTime` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Duration`, variableId: `media_${mediaLayerName}_duration` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Remaining Time`, variableId: `media_${mediaLayerName}_remainingTime` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Progress`, variableId: `media_${mediaLayerName}_progress` })
	}
	const filteredVariables = [...globalSettings]
	instance.setVariableDefinitions(filteredVariables)
}
