import { v2Actions } from './v2CommandsToUpgradeTov3'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UpgradeV2toV3(_context: any, _props: any): any {
	return {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}
}

export function UpgradeV2ToV3(_context: any, props: any): any {
	const actions = props.actions

	const result: any = {
		updatedActions: [],
		updatedConfig: null,
		updatedFeedbacks: [],
	}

	for (const action of actions) {
		// API 2.0: options are now { isExpression, value } shape
		const actionIdOpt = action.options.actionID
		const actionIdValue = actionIdOpt && typeof actionIdOpt === 'object' && 'value' in actionIdOpt
			? String(actionIdOpt.value)
			: undefined

		if (
			(action.actionId === 'UserActions' ||
				action.actionId === 'GlobalActions' ||
				action.actionId === 'SpecialActions') &&
			actionIdValue !== undefined &&
			Object.prototype.hasOwnProperty.call(v2Actions, actionIdValue)
		) {
			const v2Action = v2Actions[actionIdValue]
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
