import { combineRgb } from "@companion-module/base";

export default {
    feedbacks() {
        var feedbacks = {};

        const white = combineRgb(255,255,255);
        const red = combineRgb(254,0,0);

        feedbacks['launchedColumn'] = {
            type: 'boolean',
            name: 'Current Column',
            description: 'Style button based on board current column',
            defaultStyle: {
                color: white,
                bgcolor: red,
            },
            options: [{
                type: 'number',
                label: 'Column',
                id: 'column',
                default: 1,
            }],
            callback: (feedback) => {
                this.log('debug', `${feedback.options.column}, ${this.currentColumn}`);
                return this.currentColumn == feedback.options.column;
            }
        }

        return feedbacks;
    }
}