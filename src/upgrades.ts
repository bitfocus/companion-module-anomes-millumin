import type {
	CompanionMigrationAction,
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext,
} from '@companion-module/base'

import { MilluminConfig } from './config'
import { v2Actions } from './v2CommandsToUpgradeTov3'

export function UpgradeV2toV3(
	_context: CompanionUpgradeContext<MilluminConfig>,
	_props: CompanionStaticUpgradeProps<MilluminConfig>,
): CompanionStaticUpgradeResult<MilluminConfig> {
	const result: CompanionStaticUpgradeResult<MilluminConfig> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	return result
}

export function UpgradeV2ToV3(
	_context: CompanionUpgradeContext<MilluminConfig>,
	props: CompanionStaticUpgradeProps<MilluminConfig>,
): CompanionStaticUpgradeResult<MilluminConfig> {
	// let config: MilluminConfig = props.config;
	const actions: CompanionMigrationAction[] = props.actions

	const result: CompanionStaticUpgradeResult<MilluminConfig> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	for (const action of actions) {
		if (
			(action.actionId === 'UserActions' ||
				action.actionId === 'GlobalActions' ||
				action.actionId === 'SpecialActions') &&
			action.options.actionID !== undefined &&
			Object.prototype.hasOwnProperty.call(v2Actions, action.options.actionID as string)
		) {
			const v2Action = v2Actions[action.options.actionID as string]
			action.actionId = v2Action.newActionId
			result.updatedActions.push(action)
		} else if (Object.prototype.hasOwnProperty.call(v2Actions, action.actionId)) {
			const v2Action = v2Actions[action.actionId]
			action.actionId = v2Action.newActionId
			result.updatedActions.push(action)
		}
	}

	return result
}

/**
 * 4.x -> 5.x
 * The "Selected Layer / ..." media actions are replaced by generic media actions with a target.
 * Existing buttons are migrated with target = selected layer, so they behave exactly the same.
 */
const SELECTED_LAYER_MIGRATIONS: {
	[oldId: string]: (o: CompanionMigrationAction['options']) => {
		actionId: string
		options: CompanionMigrationAction['options']
	}
} = {
	Action_SelectedLayer_RestartMedia: () => ({ actionId: 'Layer_StartMedia', options: { startMode: 'restart' } }),
	Action_SelectedLayer_StartMedia_ByIndex: (o) => ({
		actionId: 'Layer_StartMedia',
		options: { startMode: 'index', index: o.index ?? 1 },
	}),
	Action_SelectedLayer_StartMedia_ByName: (o) => ({
		actionId: 'Layer_StartMedia',
		options: { startMode: 'name', name: o.name ?? '' },
	}),
	Action_SelectedLayer_PauseMedia: () => ({ actionId: 'Layer_PauseMedia', options: {} }),
	Action_SelectedLayer_PlayOrPauseMedia: () => ({ actionId: 'Layer_StartOrPauseMedia', options: {} }),
	// Note: in 4.x the "Stop Media" action had this (misleading) id
	Action_SelectedLayer_StartOrPauseMedia: () => ({ actionId: 'Layer_StopMedia', options: {} }),
	Action_SelectedLayer_GoToMediaTime: (o) => ({ actionId: 'Media_Time', options: { time: String(o.time ?? 0) } }),
	Action_SelectedLayer_GoToMediaNormalizedTime: (o) => ({
		actionId: 'Media_NormalizedTime',
		options: { value: String(o.value ?? 0) },
	}),
	Action_SelectedLayer_SetMediaSpeed: (o) => ({
		actionId: 'Media_Speed',
		options: { mode: 'set', value: String(o.value ?? 1) },
	}),
}

export function UpgradeV4ToV5(
	_context: CompanionUpgradeContext<MilluminConfig>,
	props: CompanionStaticUpgradeProps<MilluminConfig>,
): CompanionStaticUpgradeResult<MilluminConfig> {
	const result: CompanionStaticUpgradeResult<MilluminConfig> = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	for (const action of props.actions) {
		const migrate = SELECTED_LAYER_MIGRATIONS[action.actionId]
		if (!migrate) continue
		const migrated = migrate(action.options)
		action.actionId = migrated.actionId
		action.options = { targetType: 'selectedLayer', targetName: '', targetIndex: '1', ...migrated.options }
		result.updatedActions.push(action)
	}

	if (props.config) {
		const config = props.config as MilluminConfig & Record<string, unknown>
		let changed = false
		if (config.pingOnConnect === undefined) {
			config.pingOnConnect = true
			changed = true
		}
		if (config.presetColumns === undefined) {
			config.presetColumns = 16
			changed = true
		}
		if (config.requeryAfterCommand === undefined) {
			config.requeryAfterCommand = true
			changed = true
		}
		if (config.autoVariables === undefined) {
			config.autoVariables = true
			changed = true
		}
		if (changed) result.updatedConfig = config
	}

	return result
}
