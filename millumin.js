var instance_skel = require('../../instance_skel');
var actions       = require('./actions');
var debug;
var log;
let currentColumn;
var OSC = require('osc');

class instance extends instance_skel {

	constructor(system,id,config) {
		super(system,id,config)

		Object.assign(this, {...actions})
		this.connecting = false;
		this.actions()
	}

	actions(system) {
		this.setActions(this.getActions(this));
	}

	updateConfig(config) {
		this.config = config;
	}

	init() {
		debug = this.debug;
		this.status(this.STATUS_UNKNOWN, "Connecting");
		log = this.log;
		this.init_variables()
		this.init_osc()
	}

	init_variables() {

		var variables = [
			{ name: 'currentColumn', label: 'current column' },
			{ name: 'remainingTime', label: 'Remaining time of clips' }
		]

		this.setVariableDefinitions(variables)

	}
	init_osc() {

		if (this.connecting) {
			return;
		}

		if (this.mSocket) {
			this.mSocket.close();
		}

		if (this.config.host !== undefined && this.config.port !== undefined) {
			this.mSocket = new OSC.UDPPort({
				localAddress: "0.0.0.0",
				localPort: this.config.receivePort,
				address: this.config.host,
				port: this.config.port,
				metadata: true
			});
			this.connecting = true;

			this.mSocket.open();

			this.mSocket.on("error", (err) => {
				debug("Error", err);
				this.log('error', "Error: " + err.message);
				this.connecting = false;
				this.status(this.STATUS_ERROR, "Can't connect to Millumin");
				if (err.code == "ECONNREFUSED") {
					this.mSocket.removeAllListeners();
				}
			});

			this.mSocket.on("close",() => {
				this.log('error', "Connection to Millumin Closed");
				this.connecting = false;
				this.mSocket.removeAllListeners();
				this.status(this.STATUS_WARNING, "CLOSED");

			});

			this.mSocket.on("ready", () => {
				this.ready = true;
				this.connecting = false;
				this.log('info',"Connected to Millumin:" + this.config.host);
				this.status(this.STATUS_OK);
			});

			this.mSocket.on("message", (message) => {
				// console.log("received : ", message);
				if (message.address.match('/millumin/board/launchedColumn')) {
					currentColumn = message.args[0].value
					this.setVariable('currentColumn', message.args[0].value)
				} else if (message.address.match(`/millumin/layer:${this.config.layer}/media/time`)) {
					this.setVariable('remainingTime', Math.round(message.args[1].value - message.args[0].value))
				} else {
					debug(message.address, message.args);
				}
			});
		}
		this.mSocket.on("data",(data)=>{
			// console.log("Got",data, "from",this.mSocket.options.address);
		});
	}

	// Return config fields for web config
	config_fields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				tooltip: 'The IP of the computer running Millumin',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				regex: this.REGEX_PORT
			},
			{
				type: 'textinput',
				id: 'receivePort',
				label: 'Receive Port',
				width: 4,
				default: '8000',
				regex: this.REGEX_PORT
			},
			{
				type: 'textinput',
				id: 'layer',
				label: 'Track time of layer name',
				width: 4,
				default: 'layer 1'
			}
		]
	}

	// When module gets deleted
	destroy() {
		debug("destory", this.id);

		if (this.mSocket) {
			this.mSocket.close();
		}

	}

	action(action) {
		var id = action.action;
		var arg = {};

		var osc = {
			'tColumn':              '/millumin/action/LaunchOrStopColumn',
			'lColumn':              '/millumin/action/launchColumn',
			'lColumnName':          '/millumin/action/launchColumn',
			'prevColumn':           '/millumin/action/launchPreviousColumn',
			'nxtColumn':            '/millumin/action/launchNextColumn',
			'playTl':               '/millumin/action/playTimeline',
			'pauseTl':              '/millumin/action/pauseTimeline',
			'tplayTl':              '/millumin/action/playOrPauseTimeline',
			'stopAll':              '/millumin/action/stopColumn',
			'gotoTlSeg':            '/millumin/action/goToTimelineSegment',
			'normTime':             '/millumin/selectedLayer/media/normalizedTime',
			'restartMedia':         '/millumin/selectedLayer/startMedia',
			'pauseMedia':           '/selectedLayer/pauseMedia',
			'tPlayMedia':           '/millumin/selectedLayer/startOrPauseMedia',
			'stopMedia':            '/millumin/selectedLayer/stopMedia',
			'startMediaAtColumn':   '/millumin/selectedLayer/startMedia',
			'startNamedMedia':      '/millumin/selectedLayer/startMedia',
			'selectLayer':          '/millumin/action/selectLayer',
			'cBoard':               '/millumin/action/selectBoard'
		};

		if (id == 'tColumn')  {
			debug('sending ',osc[id],"to",this.config.host);
			arg = {
				type: "i",
				value: parseInt(action.options.int)
			};
			this.system.emit('osc_send', this.config.host, this.config.port, osc[id], [arg]);
		}

		else if (id == 'lColumn')  {
			debug('sending ',osc[id],"to",this.config.host);
			arg = {
				type: "i",
				value: parseInt(action.options.int)
			};
			this.system.emit('osc_send', this.config.host, this.config.port, osc[id], [arg]);
		}

		else if (id == 'lColumnName')  {
			debug('sending ',osc[id],"to",this.config.host);
			arg = {
				type: "s",
				value: action.options.string
			};
			this.system.emit('osc_send', this.config.host, this.config.port, osc[id], [arg]);
		}

		else if (id == 'gotoTlSeg')  {
			debug('sending ',osc[id],"to",this.config.host);
			arg = {
				type: "s",
				value: "" + action.options.string
			};
			this.system.emit('osc_send', this.config.host, this.config.port, osc[id], [arg]);
		}

		else if (id == 'normTime')  {
			debug('sending ',osc[id],"to",this.config.host);
			arg = {
				type: "f",
				value: parseFloat(action.options.float)
			};
			this.system.emit('osc_send', this.config.host, this.config.port, osc[id], [arg]);
		}

		else if (id == 'startMediaAtColumn')  {
			debug('sending ',osc[id],"to",this.config.host);
			arg = {
				type: "i",
				value: parseInt(action.options.int)
			};
			this.system.emit('osc_send', this.config.host, this.config.port, osc[id], [arg]);
		}

		else if (id == 'startNamedMedia')  {
			debug('sending ',osc[id],"to",this.config.host);
			arg = {
				type: "s",
				value: "" + action.options.string
			};
			this.system.emit('osc_send', this.config.host, this.config.port, osc[id], [arg]);
		}

		else if (id == 'selectLayer')  {
			arg = {
				type: "i",
				value: parseInt(action.options.int)
			};
			this.system.emit('osc_send', this.config.host, this.config.port, osc[id], [arg]);
			debug('sending ',osc[id],arg,"to",this.config.host);
		}

		else if (id == 'cBoard')  {
			debug('sending ',osc[id],"to",this.config.host);
			arg = {
				type: "i",
				value: parseInt(action.options.int)
			};
			this.system.emit('osc_send', this.config.host, this.config.port, osc[id], [arg]);
		}

		else if (id == 'playMediaInColumn') {
			debug('sending ',`/millumin/${action.options.layer}/startMedia`,"to",this.config.host);
			let argL = {
				type: "s",
				value: "" + action.options.layer
			};
			arg = {
				type: "i",
				value: parseInt(action.options.int)
			}
			this.system.emit('osc_send', this.config.host, this.config.port, '/millumin/action/selectLayer', [argL]);
			currentColumn = action.options.int
			this.setVariable('currentColumn', action.options.int)
			this.system.emit('osc_send', this.config.host, this.config.port, '/millumin/selectedLayer/startMedia', [arg]);
			// console.log('returning var ',this.getVariable('currentColumn'))
		}

		else if (id == 'playMediaInNextColumn') {
			let argL = {
				type: "s",
				value: "" + action.options.layer
			};
			// on first time set value
			currentColumn !== undefined ? currentColumn++ : currentColumn = 1
			arg = {
				type: "i",
				value: parseInt(currentColumn)
			}
			this.system.emit('osc_send', this.config.host, this.config.port, '/millumin/action/selectLayer', [argL]);
			this.system.emit('osc_send', this.config.host, this.config.port, '/millumin/selectedLayer/startMedia', [arg]);
			this.setVariable('currentColumn', currentColumn)
		}

		else if (id == 'playMediaInPreviousColumn') {
			let argL = {
				type: "s",
				value: "" + action.options.layer
			}
			// on first time set value, and make sure no column lower then 1 is selected
			currentColumn !== undefined || currentColumn > 1 ? currentColumn-- : currentColumn = 1
			arg = {
				type: "i",
				value: parseInt(currentColumn)
			}

			this.system.emit('osc_send', this.config.host, this.config.port, '/millumin/action/selectLayer', [argL]);
			this.system.emit('osc_send', this.config.host, this.config.port, '/millumin/selectedLayer/startMedia', [arg]);
			this.setVariable('currentColumn', currentColumn)
		}

		else if (osc[id] !== undefined) {
			debug('sending adress only',osc[id],"to",this.config.host);
			this.system.emit('osc_send', this.config.host, this.config.port, osc[id], []);
		}
	}
}
exports = module.exports = instance;
