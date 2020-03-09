exports.getActions = function(arg) {

	var actions = {}

	actions['tColumn'] = {
		label: 'Toggle Column (number)',
		options: [{
			type: 'textinput',
			label: 'Column',
			id: 'int',
			default: 1,
			regex: arg.REGEX_NUMBER
		}]
	}

	actions['lColumn'] = {
		label:'Launch Column (number)',
		options: [
			{
				type: 'textinput',
				label: 'Column',
				id: 'int',
				default: 1,
				regex: arg.REGEX_NUMBER
			}
		]
	}

	actions['lColumnName'] = {
		label:'Launch Column (name)',
		options: [
			{
				type: 'textinput',
				label: 'Column',
				id: 'string'
			}
		]
	}

	actions['gotoTlSeg'] = {
		label:'Goto Timeline Segment (name)',
		options: [
			{
				type: 'textinput',
				label: 'Name',
				id: 'string',
				default: 'name',
			}
		]
	}

	actions['normTime'] = {
		label:'Goto Media Normalized Time (number)',
		options: [
			{
				type: 'textinput',
				label: '0.9 = last 10% of media',
				id: 'float',
				default: '0.9',
				regex: arg.REGEX_FLOAT
			}
		]
	}

	actions['startMediaAtColumn'] = {
		label: 'Start Media at Column (number)',
		options: [
			{
				type: 'textinput',
				label: 'Column',
				id: 'int',
				default: 1,
				tooltip: 'Column number',
				regex: arg.REGEX_NUMBER
			}
		]
	}

	actions['startNamedMedia'] = {
			label:'Start (name) Media',
			options: [
				{
					type: 'textinput',
					label: 'Name',
					id: 'string',
					default: 'name.mov',
			}
		]
	}

	actions['selectLayer'] = {
			label:'Select Layer by Index',
			options: [
				{
					type: 'textinput',
					label: 'Name',
					id: 'int',
					regex: arg.REGEX_NUMBER
			}
		]
	}

	actions['cBoard'] = {
		label:'Change Board (number)',
		options: [
			{
				type: 'textinput',
				label: 'board number',
				id: 'int',
				default: 1,
				regex: arg.REGEX_NUMBER
			}
		]
	}

	actions['nxtColumn'] =    { label: 'Next Column' }
	actions['prevColumn'] =   { label: 'Previous Column'}
	actions['stopAll'] =      { label: 'Stop all Columns' }
	actions['playTl'] =       { label: 'Play Timeline' }
	actions['pauseTl'] =      { label: 'Pause Timeline' }
	actions['tplayTl'] =      { label: 'Play or Pause Timeline'}
	actions['restartMedia'] = { label: 'Restart Media'}
	actions['pauseMedia'] =   { label: 'Pause Media'}
	actions['tPlayMedia'] =   { label: 'Toggle Play Media'}
	actions['stopMedia'] =   { label: 'Stop Media'}

	actions['playMediaInColumn'] = {
		label: 'Play media from layer on column',
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
				regex: arg.REGEX_NUMBER
			}]
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
		]
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
		]
	}

	return actions
}
