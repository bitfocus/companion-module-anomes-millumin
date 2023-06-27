import { ActionId } from './actions'

interface v2Action {
	[key: string]: {
		oldActionId: string
		newActionId: string
		type: string
		isGroupBased?: boolean
	}
}

export const v2Actions: v2Action = {
	Action_LaunchNextColumn: {
		oldActionId: '/millumin/action/launchNextColumn',
		newActionId: ActionId.Action_LaunchNextColumn,
		type: 'GlobalActions',
	},
}