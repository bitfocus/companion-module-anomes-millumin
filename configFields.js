import { Regex } from "@companion-module/base";

export default {
    getConfigFields() {
        return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				tooltip: 'The IP of the computer running Millumin',
				width: 6,
				regex: Regex.IP
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				regex: Regex.PORT
			},
			{
				type: 'textinput',
				id: 'receivePort',
				label: 'Receive Port',
				width: 4,
				default: '8000',
				regex: Regex.PORT
			},
			{
				type: 'textinput',
				id: 'layer',
				label: 'Track time of layer name',
				width: 4,
				default: 'layer 1'
			}
		];
    }
}