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
		const sanitizedName = mediaLayerName.replace(/\s+/g, '_') // Replace spaces with underscores
		
		variables[`media_${sanitizedName}_elapsedTime`] = mediaLayer.elapsedTime
		variables[`media_${sanitizedName}_duration`] = mediaLayer.duration
		if (0 < mediaLayer.duration) {
			variables[`media_${sanitizedName}_remainingTime`] = mediaLayer.duration - mediaLayer.elapsedTime
			variables[`media_${sanitizedName}_progress`] = mediaLayer.elapsedTime / mediaLayer.duration
		} else {
			variables[`media_${sanitizedName}_remainingTime`] = 0
			variables[`media_${sanitizedName}_progress`] = 0
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
		const sanitizedName = mediaLayerName.replace(/\s+/g, '_') // Replace spaces with underscores
		
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Elapsed Time`, variableId: `media_${sanitizedName}_elapsedTime` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Duration`, variableId: `media_${sanitizedName}_duration` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Remaining Time`, variableId: `media_${sanitizedName}_remainingTime` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Progress`, variableId: `media_${sanitizedName}_progress` })
	}
	const filteredVariables = [...globalSettings]
	instance.setVariableDefinitions(filteredVariables)
}