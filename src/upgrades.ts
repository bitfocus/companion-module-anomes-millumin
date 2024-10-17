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
