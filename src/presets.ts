import { CompanionButtonPresetDefinition, CompanionPresetDefinitions } from '@companion-module/base'
import { ActionId } from './actions'

interface CompanionPresetExt extends CompanionButtonPresetDefinition {
	steps: Array<{
		down: Array<
			{
				actionId: ActionId
			} & CompanionButtonPresetDefinition['steps'][0]['down'][0]
		>
		up: Array<
			{
				actionId: ActionId
			} & CompanionButtonPresetDefinition['steps'][0]['up'][0]
		>
	}>
}

interface CompanionPresetDefinitionsExt {
	[id: string]: CompanionPresetExt | undefined
}

export function GetPresetList(): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitionsExt = {}
	return presets
}
