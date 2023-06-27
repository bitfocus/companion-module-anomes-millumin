import { Regex, SomeCompanionConfigField } from '@companion-module/base'



export interface MilluminConfig {
	label: string
	host: string
	tx_port: number
	rx_port: number
	timeLayerName: string
}



export const GetConfigFields = (): SomeCompanionConfigField[] => {
	return [
		{
			type: 'static-text',
			width: 12,
			value: '',
			id: 'info',
			label: '',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'The IP of the computer running Millumin',
			width: 12,
			default: '127.0.0.1',
			regex: Regex.IP
		},
		{
			type: 'number',
			id: 'tx_port',
			label: 'Sending port',
			width: 6,
			default: 5000,
			min: 1,
			max: 65535,
			step: 1,
		},
		{
			type: 'number',
			id: 'rx_port',
			label: 'Receive port',
			width: 6,
			default: 8000,
			min: 1,
			max: 65535,
			step: 1,
		},
		{
			type: 'static-text',
			width: 12,
			value: '',
			id: 'info',
			label: '',
		},
		{
			type: 'textinput',
			id: 'timeLayerName',
			label: 'Name of the layer to track time',
			width: 12,
			default: 'layer'
		}
	]
}
