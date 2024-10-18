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
		variables[`${mediaLayerName}_timeLayerElapsedTime`] = mediaLayer.timeLayerElapsedTime
		variables[`${mediaLayerName}_timeLayerDuration`] = mediaLayer.timeLayerDuration
		if (0 < mediaLayer.timeLayerDuration) {
			variables[`${mediaLayerName}_timeLayerRemainingTime`] = mediaLayer.timeLayerDuration - mediaLayer.timeLayerElapsedTime
			variables[`${mediaLayerName}_timeLayerProgress`] = mediaLayer.timeLayerElapsedTime / mediaLayer.timeLayerDuration
		} else {
			variables[`${mediaLayerName}_timeLayerRemainingTime`] = 0
			variables[`${mediaLayerName}_timeLayerProgress`] = 0
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
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Elapsed Time`, variableId: `${mediaLayerName}_timeLayerElapsedTime` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Duration`, variableId: `${mediaLayerName}_timeLayerDuration` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Remaining Time`, variableId: `${mediaLayerName}_timeLayerRemainingTime` })
		globalSettings.add({ name: `${mediaLayerName} / Time Layer / Progress`, variableId: `${mediaLayerName}_timeLayerProgress` })
	}
	const filteredVariables = [...globalSettings]
	instance.setVariableDefinitions(filteredVariables)
}
