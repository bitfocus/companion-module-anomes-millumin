import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import { MilluminConfig } from './config'
import { InstanceBaseExt } from './utils'


export function updateVariables(instance: InstanceBaseExt<MilluminConfig>): void {
	const variables: CompanionVariableValues = {}
	variables['currentColumnIndex'] = instance.currentColumnIndex
	variables['currentColumnName'] = instance.currentColumnName
	variables['previousColumnName'] = instance.previousColumnName
	variables['nextColumnName'] = instance.nextColumnName
	variables['timeLayerElapsedTime'] = instance.timeLayerElapsedTime
	variables['timeLayerDuration'] = instance.timeLayerDuration
	if(0 < instance.timeLayerDuration) {
		variables['timeLayerRemainingTime'] = instance.timeLayerDuration - instance.timeLayerElapsedTime
		variables['timeLayerProgress'] = instance.timeLayerElapsedTime / instance.timeLayerDuration
	}
	else {
		variables['timeLayerRemainingTime'] = 0
		variables['timeLayerProgress'] = 0
	}
	instance.setVariableValues(variables)
}


export function initVariables(instance: InstanceBaseExt<MilluminConfig>): void {
	const globalSettings: Set<CompanionVariableDefinition> = new Set([
		{ name: 'Current Column Index', variableId: 'currentColumnIndex' },
		{ name: 'Current Column Name', variableId: 'currentColumnName' },
		{ name: 'Previous Column Name', variableId: 'previousColumnName' },
		{ name: 'Next Column Name', variableId: 'nextColumnName' },
		{ name: 'Time Layer / Elapsed Time', variableId: 'timeLayerElapsedTime' },
		{ name: 'Time Layer / Duration', variableId: 'timeLayerDuration' },
		{ name: 'Time Layer / Remaining Time', variableId: 'timeLayerRemainingTime' },
		{ name: 'Time Layer / Progress', variableId: 'timeLayerProgress' },
	])
	const filteredVariables = [
		...globalSettings,
	]
	instance.setVariableDefinitions(filteredVariables)
}
