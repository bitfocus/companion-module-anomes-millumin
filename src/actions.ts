import { CompanionActionDefinition, CompanionActionDefinitions } from '@companion-module/base'
import { MilluminConfig } from './config'
import { InstanceBaseExt , options } from './utils'



export enum ActionId {
	Action_LaunchOrStopColumn_ByIndex = 'Action_LaunchOrStopColumn_ByIndex',
	Action_LaunchOrStopColumn_ByName = 'Action_LaunchOrStopColumn_ByName',
	Action_LaunchColumn_ByIndex = 'Action_LaunchColumn_ByIndex',
	Action_LaunchColumn_ByName = 'Action_LaunchColumn_ByName',
	Action_StopColumn = 'Action_StopColumn',
	Action_LaunchPreviousColumn = 'Action_LaunchPreviousColumn',
	Action_LaunchNextColumn = 'Action_LaunchNextColumn',
	Action_Pause = 'Action_Pause',
	Action_Play = 'Action_Play',
	Action_PlayOrPause = 'Action_PlayOrPause',
	Action_GoToTime = 'Action_GoToTime',
	Action_GoToTimelineSegment = 'Action_GoToTimelineSegment',
	Action_SelectBoard_ByIndex = 'Action_SelectBoard_ByIndex',
	Action_SelectBoard_ByName = 'Action_SelectBoard_ByName',
	Action_SelectLayer_ByIndex = 'Action_SelectLayer_ByIndex',
	Action_SelectLayer_ByName = 'Action_SelectLayer_ByName',
	Action_SelectLight_ByIndex = 'Action_SelectLight_ByIndex',
	Action_SelectLight_ByName = 'Action_SelectLight_ByName',
	Action_SetMasterVideo = 'Action_SetMasterVideo',
	Action_SetMasterAudio = 'Action_SetMasterAudio',
	Action_SetMasterDMX = 'Action_SetMasterDMX',
	Action_EnterFullscreen = 'Action_EnterFullscreen',
	Action_ExitFullscreen = 'Action_ExitFullscreen',
	Action_DisplayTestCard = 'Action_DisplayTestCard',
	Action_HideTestCard = 'Action_HideTestCard',
	Action_DisableWorkspace = 'Action_DisableWorkspace',
	Action_EnableWorkspace = 'Action_EnableWorkspace',
	Action_OpenProject = 'Action_OpenProject',
	Action_SaveProject = 'Action_SaveProject',
	Action_SaveProjectAs = 'Action_SaveProjectAs',
	Action_Quit = 'Action_Quit',
	Action_SelectedLayer_RestartMedia = 'Action_SelectedLayer_RestartMedia',
	Action_SelectedLayer_StartMedia_ByIndex = 'Action_SelectedLayer_StartMedia_ByIndex',
	Action_SelectedLayer_StartMedia_ByName = 'Action_SelectedLayer_StartMedia_ByName',
	Action_SelectedLayer_PauseMedia = 'Action_SelectedLayer_PauseMedia',
	Action_SelectedLayer_StartOrPauseMedia = 'Action_SelectedLayer_PlayOrPauseMedia',
	Action_SelectedLayer_StopMedia = 'Action_SelectedLayer_StartOrPauseMedia',
	Action_SelectedLayer_GoToMediaTime = 'Action_SelectedLayer_GoToMediaTime',
	Action_SelectedLayer_GoToMediaNormalizedTime = 'Action_SelectedLayer_GoToMediaNormalizedTime',
	Action_SelectedLayer_SetMediaSpeed = 'Action_SelectedLayer_SetMediaSpeed',
}





export function GetActions(instance: InstanceBaseExt<MilluminConfig>): CompanionActionDefinitions {

	const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		[ActionId.Action_LaunchOrStopColumn_ByIndex]: {
			name: 'Launch or Stop Column by Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/launchOrStopColumn', [{type:'i',value:action.options.index}])
			},
		},
		[ActionId.Action_LaunchOrStopColumn_ByName]: {
			name: 'Launch or Stop Column by Name',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/launchOrStopColumn', [{type:'s',value:action.options.name}])
			},
		},
		[ActionId.Action_LaunchColumn_ByIndex]: {
			name: 'Launch Column by Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/launchColumn', [{type:'i',value:action.options.index}])
			},
		},
		[ActionId.Action_LaunchColumn_ByName]: {
			name: 'Launch Column by Name',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/launchColumn', [{type:'s',value:action.options.name}])
			},
		},
		[ActionId.Action_StopColumn]: {
			name: 'Stop Column',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/stopColumn', [])
			},
		},
		[ActionId.Action_LaunchPreviousColumn]: {
			name: 'Launch Previous Column',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/launchPreviousColumn', [])
			},
		},
		[ActionId.Action_LaunchNextColumn]: {
			name: 'Launch Next Column',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/launchNextColumn', [])
			},
		},
		[ActionId.Action_Pause]: {
			name: 'Pause',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/pause', [])
			},
		},
		[ActionId.Action_Play]: {
			name: 'Play',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/play', [])
			},
		},
		[ActionId.Action_PlayOrPause]: {
			name: 'Play or Pause',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/playOrPause', [])
			},
		},
		[ActionId.Action_GoToTime]: {
			name: 'Go to Time',
			options: [options.time],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/goToTime', [{type:'f',value:action.options.time}])
			},
		},
		[ActionId.Action_GoToTimelineSegment]: {
			name: 'Go to Timeline Segment',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/goToTimelineSegment', [{type:'s',value:action.options.name}])
			},
		},
		[ActionId.Action_SelectBoard_ByIndex]: {
			name: 'Select Board By Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectBoard', [{type:'i',value:action.options.index}])
			},
		},
		[ActionId.Action_SelectBoard_ByName]: {
			name: 'Select Board By Index',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectBoard', [{type:'s',value:action.options.name}])
			},
		},
		[ActionId.Action_SelectLayer_ByIndex]: {
			name: 'Select Layer By Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectLayer', [{type:'i',value:action.options.index}])
			},
		},
		[ActionId.Action_SelectLayer_ByName]: {
			name: 'Select Layer By Index',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectLayer', [{type:'s',value:action.options.name}])
			},
		},
		[ActionId.Action_SelectLight_ByIndex]: {
			name: 'Select Light By Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectLight', [{type:'i',value:action.options.index}])
			},
		},
		[ActionId.Action_SelectLight_ByName]: {
			name: 'Select Light By Index',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectLight', [{type:'s',value:action.options.name}])
			},
		},
		[ActionId.Action_SetMasterVideo]: {
			name: 'Set Master Video',
			options: [options.value],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/masterVideo', [{type:'f',value:action.options.value}])
			},
		},
		[ActionId.Action_SetMasterAudio]: {
			name: 'Set Master Audio',
			options: [options.value],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/masterAudio', [{type:'f',value:action.options.value}])
			},
		},
		[ActionId.Action_SetMasterDMX]: {
			name: 'Set Master MDX',
			options: [options.value],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/masterDMX', [{type:'f',value:action.options.value}])
			},
		},
		[ActionId.Action_EnterFullscreen]: {
			name: 'Enter Fullscreen',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/enterFullscreen', [])
			},
		},
		[ActionId.Action_ExitFullscreen]: {
			name: 'Exit Fullscreen',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/exitFullscreen', [])
			},
		},
		[ActionId.Action_DisplayTestCard]: {
			name: 'Display TestCard',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/displayTestCard', [])
			},
		},
		[ActionId.Action_HideTestCard]: {
			name: 'Hide TestCard',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/hideTestCard', [])
			},
		},
		[ActionId.Action_DisableWorkspace]: {
			name: 'Disable Workspace',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/disableWorkspace', [])
			},
		},
		[ActionId.Action_EnableWorkspace]: {
			name: 'Enable Workspace',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/enableWorkspace', [])
			},
		},
		[ActionId.Action_OpenProject]: {
			name: 'Open Project',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/openProject', [{type:'s',value:action.options.name}])
			},
		},
		[ActionId.Action_SaveProject]: {
			name: 'Save Project',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/saveProject', [])
			},
		},
		[ActionId.Action_SaveProjectAs]: {
			name: 'Save Project As',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/saveProject', [{type:'s',value:action.options.name}])
			},
		},
		[ActionId.Action_Quit]: {
			name: 'Quit',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/quit', [])
			},
		},


		[ActionId.Action_SelectedLayer_RestartMedia]: {
			name: 'Selected Layer / Restart Media',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/startMedia', [])
			},
		},
		[ActionId.Action_SelectedLayer_StartMedia_ByIndex]: {
			name: 'Selected Layer / Start Media by Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/startMedia', [{type:'i',value:action.options.index}])
			},
		},
		[ActionId.Action_SelectedLayer_StartMedia_ByName]: {
			name: 'Selected Layer / Start Media by Name',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/startMedia', [{type:'s',value:action.options.name}])
			},
		},
		[ActionId.Action_SelectedLayer_PauseMedia]: {
			name: 'Selected Layer / Pause Media',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/pauseMedia', [])
			},
		},
		[ActionId.Action_SelectedLayer_StartOrPauseMedia]: {
			name: 'Selected Layer / Start or Pause Media',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/startOrPauseMedia', [])
			},
		},
		[ActionId.Action_SelectedLayer_StopMedia]: {
			name: 'Selected Layer / Stop Media',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/stopMedia', [])
			},
		},
		[ActionId.Action_SelectedLayer_GoToMediaTime]: {
			name: 'Selected Layer / Go to Media Time',
			options: [options.time],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/media/time', [{type:'f',value:action.options.time}])
			},
		},
		[ActionId.Action_SelectedLayer_GoToMediaNormalizedTime]: {
			name: 'Selected Layer / Go to Media Normalized Time',
			options: [options.value],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/media/normalizedTime', [{type:'f',value:action.options.value}])
			},
		},
		[ActionId.Action_SelectedLayer_SetMediaSpeed]: {
			name: 'Selected Layer / Set Media Speed',
			options: [options.value],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/media/speed', [{type:'f',value:action.options.value}])
			},
		},
	}

	return actions
}
