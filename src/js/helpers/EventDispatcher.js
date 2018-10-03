const _ = require('lodash');

/**
 * Class that fires events
 */
class EventDispatcher {
    constructor() {
        let eventListeners_ = {};

        /**
         * Emits an event, callin specified previously event listener
         * @param event String name of the event
         */
        this.dispatch = (event)=> {
            if (eventListeners_[event.type]) {
                _.each(eventListeners_[event.type], (callback)=> {
                    callback(event);
                });
            }
        };

        this.emit = this.dispatch;

        this.addEventListener = (eventType, callback)=> {
            if (!eventListeners_[eventType]) {
                eventListeners_[eventType] = [];
            }

            eventListeners_[eventType].push(callback);
        };

        this.removeEventListener = (eventType, callback)=> {
            if (!eventListeners_[eventType]) {
                return;
            }

            eventListeners_[eventType] = _.filter(eventListeners_[eventType], (listener)=> {
                return listener != callback;
            })

        };

        this.removeEventListeners = (eventType)=> {
            eventListeners_[eventType] = [];
        }
    }
}

module.exports = EventDispatcher;
