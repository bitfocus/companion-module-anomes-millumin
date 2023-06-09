import { InstanceBase, InstanceStatus, runEntrypoint } from '@companion-module/base';
import OSC from 'osc';
import actions from "./actions.js"
import configFields from './configFields.js';
import feedbacks from './feedbacks.js';
import { formatSeconds } from './utils.js';
const {UDPPort} = OSC;

class MilluminInstance extends InstanceBase {

	constructor(system,id,config) {
		super(system,id,config)

		Object.assign(this, {
			...actions,
			...configFields,
			...feedbacks,
		})
		this.connecting = false;
		this.actions()
	}

	configUpdated(config) {
		this.config = config;
	}

	async init(config) {
		this.updateStatus(InstanceStatus.Connecting);
		this.configUpdated(config);
		this.setActionDefinitions(this.actions())
		this.setFeedbackDefinitions(this.feedbacks());
		this.initVariables()
		this.initOsc()
	}

	initVariables() {

		var variables = [
			{ variableId: 'currentColumn', name: 'Current column' },
			{ variableId: 'remainingTime', name: 'Remaining time of clips' },
			{ variableId: 'formattedRemainingTime', name: 'Formatted remaining time' }
		]

		this.setVariableDefinitions(variables)
		this.setVariableValues({
			currentColumn: 0,
			remainingTime: 0,
			formattedRemainingTime: '00:00:00',
		})
		this.currentColumn = 0;
	}
	initOsc() {

		this.log("debug", "initOsc")

		if (this.connecting) {
			return;
		}

		if (this.mSocket) {
			this.mSocket.close();
		}

		if (this.config.host !== undefined && this.config.port !== undefined) {
			this.mSocket = new UDPPort({
				localAddress: "0.0.0.0",
				localPort: this.config.receivePort,
				address: this.config.host,
				port: this.config.port,
				metadata: true
			});
			this.connecting = true;

			this.mSocket.open();

			this.mSocket.on("error", (err) => {
				this.log('error', "Error: " + err.message);
				this.connecting = false;
				this.updateStatus(InstanceStatus.ConnectionFailure);
				if (err.code == "ECONNREFUSED") {
					this.mSocket.removeAllListeners();
				}
			});

			this.mSocket.on("close",() => {
				this.log('error', "Connection to Millumin Closed");
				this.connecting = false;
				this.mSocket.removeAllListeners();
				this.updateStatus(InstanceStatus.Disconnected);

			});

			this.mSocket.on("ready", () => {
				this.ready = true;
				this.connecting = false;
				this.log('info',"Connected to Millumin:" + this.config.host);
				this.updateStatus(InstanceStatus.Ok);
			});

			this.mSocket.on("message", (message) => {
				if (message.address.match('/millumin/board/launchedColumn')) {
					this.setVariableValues({currentColumn: message.args[0].value})
					this.currentColumn = message.args[0].value;
					this.checkFeedbacks('launchedColumn')
				} else if (message.address.match(`/millumin/layer:${this.config.layer}/media/time`)) {
					const remainingTimeInSeconds = Math.round(message.args[1].value - message.args[0].value);
					this.setVariableValues({
						remainingTime: remainingTimeInSeconds,
						formattedRemainingTime: formatSeconds(remainingTimeInSeconds),
					});
				} else if (message.address.match(`/millumin/layer:${this.config.layer}/mediaStopped`)) {
					this.setVariableValues({
						remainingTime: 0,
						formattedRemainingTime: '00:00:00',
					})
				} else {
					this.log('debug', message.address, message.args);
				}
			});
		}
	}

	// When module gets deleted
	destroy() {
		this.log('debug', "destroy", this.id);

		if (this.mSocket) {
			this.mSocket.close();
		}

	}
}

runEntrypoint(MilluminInstance, []);