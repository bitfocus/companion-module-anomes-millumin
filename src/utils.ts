import { CompanionInputFieldNumber, CompanionInputFieldTextInput, InstanceBase } from '@companion-module/base'
import { OSCResponse } from './osc'

type EnforceDefault<T, U> = Omit<T, 'default'> & { default: U }

export interface Options {
	index: EnforceDefault<CompanionInputFieldNumber, number>
	name: EnforceDefault<CompanionInputFieldTextInput, string>
	time: EnforceDefault<CompanionInputFieldNumber, number>
	value: EnforceDefault<CompanionInputFieldNumber, number>
	oscPath: EnforceDefault<CompanionInputFieldTextInput, string>
	oscArgs: EnforceDefault<CompanionInputFieldTextInput, string>
}

export const options: Options = {
	index: {
		type: 'number',
		label: 'Index',
		id: 'index',
		default: 1,
		min: 1,
		max: 4096,
	},
	name: {
		type: 'textinput',
		label: 'Name',
		id: 'name',
		default: '',
	},
	time: {
		type: 'number',
		label: 'Time',
		id: 'time',
		default: 0,
		min: -65535,
		max: 65535,
	},
	value: {
		type: 'number',
		label: 'Value',
		id: 'value',
		default: 0,
		min: -65535,
		max: 65535,
	},
	oscPath: {
		type: 'textinput',
		label: 'OSC Path',
		id: 'oscPath',
		default: '/millumin/action/custom',
		tooltip: 'Enter the OSC path (e.g., /millumin/action/custom)',
	},
	oscArgs: {
		type: 'textinput',
		label: 'OSC Arguments',
		id: 'oscArgs',
		default: '',
		tooltip: 'Optional: Enter arguments as comma-separated values with type prefix (e.g., i:1,s:hello,f:0.5)',
	},
}

export interface MediaLayer {
	elapsedTime: any
	duration: any
	mediaIndex: any
}

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig
	OSC: any

	currentColumnIndex: any
	currentColumnName: any
	previousColumnName: any
	nextColumnName: any
	mediaLayers: { [id: string]: MediaLayer }

	initVariables(): void
	updateVariablesValues(): void
	receiveOSCResponse(data: OSCResponse): void
}
