import { Regex } from "@companion-module/base"

export default {
	actions() {
		var oscCommands = {
			'tColumn':              '/millumin/action/launchOrStopColumn',
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

		var actions = {}

		actions['tColumn'] = {
			name: 'Toggle Column (number)',
			options: [{
				type: 'textinput',
				label: 'Column',
				id: 'int',
				default: 1,
				regex: Regex.NUMBER
			}],
			callback: async (event) => {
				this.log('debug',`sending ${oscCommands[event.actionId]} to ${this.config.host}`);
				const arg = {
					type: "i",
					value: parseInt(event.options.int)
				};
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], [arg]);
			}
		}

		actions['lColumn'] = {
			name:'Launch Column (number)',
			options: [
				{
					type: 'textinput',
					label: 'Column',
					id: 'int',
					default: 1,
					regex: Regex.NUMBER
				}
			],
			callback: async (event) => {
				this.log('debug',`sending ${oscCommands[event.actionId]} to ${this.config.host}`);
				const arg = {
					type: "i",
					value: parseInt(event.options.int)
				};
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], [arg]);
			}
		}

		actions['lColumnName'] = {
			name:'Launch Column (name)',
			options: [
				{
					type: 'textinput',
					label: 'Column',
					id: 'string'
				}
			],
			callback: async (event) => {
				this.log('debug',`sending ${oscCommands[event.actionId]} to ${this.config.host}`);
				const arg = {
					type: "s",
					value: event.options.string
				};
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], [arg]);
			}
		}

		actions['gotoTlSeg'] = {
			name:'Goto Timeline Segment (name)',
			options: [
				{
					type: 'textinput',
					label: 'Name',
					id: 'string',
					default: 'name',
				}
			],
			callback: async (event) => {
				this.log('debug',`sending ${oscCommands[event.actionId]} to ${this.config.host}`);
				const arg = {
					type: "s",
					value: "" + event.options.string
				};
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], [arg]);
			}
		}

		actions['normTime'] = {
			name:'Goto Media Normalized Time (number)',
			options: [
				{
					type: 'textinput',
					label: '0.9 = last 10% of media',
					id: 'float',
					default: '0.9',
					regex: Regex.FLOAT_OR_INT
				}
			],
			callback: async (event) => {
				this.log('debug',`sending ${oscCommands[event.actionId]} to ${this.config.host}`);
				const arg = {
					type: "f",
					value: parseFloat(event.options.float)
				};
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], [arg]);
			}
		}

		actions['startMediaAtColumn'] = {
			name: 'Start Media at Column (number)',
			options: [
				{
					type: 'textinput',
					label: 'Column',
					id: 'int',
					default: 1,
					tooltip: 'Column number',
					regex: Regex.NUMBER
				}
			],
			callback: async (event) => {
				this.log('debug',`sending ${oscCommands[event.actionId]} to ${this.config.host}`);
				const arg = {
					type: "i",
					value: parseInt(event.options.int)
				};
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], [arg]);
			}
		}

		actions['startNamedMedia'] = {
				name:'Start (name) Media',
				options: [
					{
						type: 'textinput',
						label: 'Name',
						id: 'string',
						default: 'name.mov',
				}
			],
			callback: async (event) => {
				this.log('debug',`sending ${oscCommands[event.actionId]} to ${this.config.host}`);
				const arg = {
					type: "s",
					value: "" + event.options.string
				};
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], [arg]);
			}
		}

		actions['selectLayer'] = {
			name:'Select Layer by Index',
			options: [
				{
					type: 'textinput',
					label: 'Name',
					id: 'int',
					regex: Regex.NUMBER
				}
			],
			callback: async (event) => {
				const arg = {
					type: "i",
					value: parseInt(event.options.int)
				};
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], [arg]);
				this.log('debug','sending ',oscCommands[event.actionId],arg,"to",this.config.host);
			}
		}

		actions['cBoard'] = {
			name:'Change Board (number)',
			options: [
				{
					type: 'textinput',
					label: 'board number',
					id: 'int',
					default: 1,
					regex: Regex.NUMBER
				}
			],
			callback: async (event) => {
				this.log('debug',`sending ${oscCommands[event.actionId]} to ${this.config.host}`);
				const arg = {
					type: "i",
					value: parseInt(event.options.int)
				};
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], [arg]);
			}
		}

		actions['nxtColumn'] = {
			name: 'Next Column',
			options: [],
			callback: async (event) => {
				this.log('debug','sending adress only',oscCommands[event.actionId],"to",this.config.host);
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], []);
			}
		};
		actions['prevColumn'] = {
			name: 'Previous Column',
			options: [],
			callback: async (event) => {
				this.log('debug','sending adress only',oscCommands[event.actionId],"to",this.config.host);
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], []);
			}
		}
		actions['stopAll'] = {
			name: 'Stop all Columns',
			options: [],
			callback: async (event) => {
				this.log('debug','sending adress only',oscCommands[event.actionId],"to",this.config.host);
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], []);
			}
		}
		actions['playTl'] = {
			name: 'Play Timeline',
			options: [],
			callback: async (event) => {
				this.log('debug','sending adress only',oscCommands[event.actionId],"to",this.config.host);
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], []);
			}
		}
		actions['pauseTl'] = {
			name: 'Pause Timeline',
			options: [],
			callback: async (event) => {
				this.log('debug','sending adress only',oscCommands[event.actionId],"to",this.config.host);
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], []);
			}
		}
		actions['tplayTl'] = {
			name: 'Play or Pause Timeline',
			options: [],
			callback: async (event) => {
				this.log('debug','sending adress only',oscCommands[event.actionId],"to",this.config.host);
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], []);
			}
		}
		actions['restartMedia'] = {
			name: 'Restart Media',
			options: [],
			callback: async (event) => {
				this.log('debug','sending adress only',oscCommands[event.actionId],"to",this.config.host);
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], []);
			}
		}
		actions['pauseMedia'] = {
			name: 'Pause Media',
			options: [],
			callback: async (event) => {
				this.log('debug','sending adress only',oscCommands[event.actionId],"to",this.config.host);
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], []);
			}
		}
		actions['tPlayMedia'] = {
			name: 'Toggle Play Media',
			options: [],
			callback: async (event) => {
				this.log('debug','sending adress only',oscCommands[event.actionId],"to",this.config.host);
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], []);
			}
		}
		actions['stopMedia'] = {
			name: 'Stop Media',
			options: [],
			callback: async (event) => {
				this.log('debug','sending adress only',oscCommands[event.actionId],"to",this.config.host);
				this.oscSend(this.config.host, this.config.port, oscCommands[event.actionId], []);
			}
		}

		actions['playMediaInColumn'] = {
			name: 'Play media from layer on column',
			options: [
				{
					type: 'textinput',
					label: 'Layer name',
					id: 'layer',
					default: 'layer 1'
				},
				{
					type: 'textinput',
					label: 'Column',
					id: 'int',
					default: 1,
					regex: Regex.NUMBER
				}],
			callback: async (event) => {
				this.log('debug','sending ',`/millumin/${event.options.layer}/startMedia`,"to",this.config.host);
				let argL = {
					type: "s",
					value: "" + event.options.layer
				};
				const arg = {
					type: "i",
					value: parseInt(event.options.int)
				}
				this.oscSend(this.config.host, this.config.port, '/millumin/action/selectLayer', [argL]);
				currentColumn = event.options.int
				this.setVariableValues({ currentColumn: event.options.int })
				this.oscSend(this.config.host, this.config.port, '/millumin/selectedLayer/startMedia', [arg]);
				// console.log('returning var ',this.getVariable('currentColumn'))
			}
		}

		actions['playMediaInNextColumn'] = {
			label: 'Next Column with layer',
			options: [
				{
					type: 'textinput',
					label: 'Layer name',
					id: 'layer',
					default: 'layer 1'
				}
			],
			callback: async (event) => {
				let argL = {
					type: "s",
					value: "" + event.options.layer
				};
				// on first time set value
				currentColumn !== undefined ? currentColumn++ : currentColumn = 1
				const arg = {
					type: "i",
					value: parseInt(currentColumn)
				}
				this.oscSend(this.config.host, this.config.port, '/millumin/action/selectLayer', [argL]);
				this.oscSend(this.config.host, this.config.port, '/millumin/selectedLayer/startMedia', [arg]);
				this.setVariableValues({ currentColumn })
			}
		}

		actions['playMediaInPreviousColumn'] = {
			label: 'Previous Column with layer',
			options: [
				{
					type: 'textinput',
					label: 'Layer name',
					id: 'layer',
					default: 'layer 1'
				}
			],
			callback: async (event) => {
				let argL = {
					type: "s",
					value: "" + event.options.layer
				}
				// on first time set value, and make sure no column lower then 1 is selected
				currentColumn !== undefined || currentColumn > 1 ? currentColumn-- : currentColumn = 1
				const arg = {
					type: "i",
					value: parseInt(currentColumn)
				}
	
				this.oscSend(this.config.host, this.config.port, '/millumin/action/selectLayer', [argL]);
				this.oscSend(this.config.host, this.config.port, '/millumin/selectedLayer/startMedia', [arg]);
				this.setVariableValues({ currentColumn })
			}
		}

		return actions
	}
}
