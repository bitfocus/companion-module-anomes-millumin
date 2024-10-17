import { CompanionInputFieldNumber, CompanionInputFieldTextInput, InstanceBase } from '@companion-module/base'
import { OSCResponse } from './osc'

type EnforceDefault<T, U> = Omit<T, 'default'> & { default: U }

export interface Options {
	index: EnforceDefault<CompanionInputFieldNumber, number>
	name: EnforceDefault<CompanionInputFieldTextInput, string>
	time: EnforceDefault<CompanionInputFieldNumber, number>
	value: EnforceDefault<CompanionInputFieldNumber, number>
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
}

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	config: TConfig
	OSC: any

	currentColumnIndex: any
	currentColumnName: any
	previousColumnName: any
	nextColumnName: any
	timeLayerElapsedTime: any
	timeLayerDuration: any

	InitVariables(): void
	UpdateVariablesValues(): void
	ReceiveOSCResponse(data: OSCResponse): void
}
