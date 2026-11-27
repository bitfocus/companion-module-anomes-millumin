import { Regex, SomeCompanionConfigField } from '@companion-module/base'

export interface MilluminConfig {
	label: string
	host: string
	tx_port: number
	rx_port: number
	timeLayerName: string
	trackMultipleLayers: boolean
	pingOnConnect: boolean
	autoVariables: boolean
	presetColumns: number
}

export const getConfigFields = (): SomeCompanionConfigField[] => {
	return [
		{
			type: 'static-text',
			width: 12,
			id: 'info',
			label: 'Millumin setup',
			value:
				'In Millumin, open the Device Manager (CMD+K), OSC tab: enable OSC input on the sending port below, and enable "API feedback" towards this computer on the receive port.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'The IP of the computer running Millumin',
			width: 12,
			default: '127.0.0.1',
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'tx_port',
			label: 'Sending port (Millumin OSC input)',
			width: 6,
			default: 5000,
			min: 1,
			max: 65535,
			step: 1,
		},
		{
			type: 'number',
			id: 'rx_port',
			label: 'Receive port (Millumin API feedback)',
			width: 6,
			default: 8000,
			min: 1,
			max: 65535,
			step: 1,
		},
		{
			type: 'checkbox',
			id: 'pingOnConnect',
			label: 'Send /ping on connection to get the full state',
			width: 6,
			default: true,
		},
		{
			type: 'checkbox',
			id: 'autoVariables',
			label: 'Create variables for every layer/light reported by Millumin',
			width: 6,
			default: true,
		},
		{
			type: 'static-text',
			width: 12,
			id: 'info2',
			label: 'Time tracking',
			value:
				'Layers listed here always get time variables and timer presets (index:1 is always tracked as "firstByIndex").',
		},
		{
			type: 'textinput',
			id: 'timeLayerName',
			label: 'Name of the layer to track time',
			width: 12,
			default: 'layer',
		},
		{
			type: 'checkbox',
			id: 'trackMultipleLayers',
			label: 'Enable tracking of multiple layer (comma separated list)',
			width: 6,
			default: false,
		},
		{
			type: 'number',
			id: 'presetColumns',
			label: 'Number of columns in presets',
			width: 6,
			default: 16,
			min: 1,
			max: 128,
			step: 1,
		},
	]
}
