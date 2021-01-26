type Constructor = new (...args: any[]) => {};

// This mixin adds a scale property, with getters and setters
// for changing it with an encapsulated private property:

export function ApplyEmitter<TBase extends Constructor>(Base: TBase) {
  return class Emitter extends Base {

    // Map of string containing a list of callback
    _emitterEvents = new Map<string, Map<Symbol, Function>>();

    on(eventName: string, callback: Function): this {
      if (!this._emitterEvents.has(eventName)) {
        this._emitterEvents.set(eventName, new Map())
      }

      this._emitterEvents
        .get(eventName)
        .set(Symbol(), callback);

      return this;
    }

    /**
     * Trigger the callbacks registered for a given event
     */
    emit(eventName: string|string[], ...datas): this {
      var eventList = eventName instanceof Array ? eventName : [ eventName ];
      
      eventList.forEach(name => {
        if (this._emitterEvents.has(name)) {
          this._emitterEvents.get(name).forEach(callback => {
            callback.call(this, ...datas);
          });
        }
      })
      
      return this;
    }

    /**
     * Register a callback for an event that will be triggered once.
     */
    once(eventName: string, callback: Function): this {
      var onceCallback = (e)=>{
        callback.call(this, e);
        this.off(eventName, onceCallback);
      }
      this.on(eventName, onceCallback);

      return this;
    }

    /**
     * Register a callback for an event that will be triggered once and resolve through a Promise
     */
    oncePromise(eventName: string): Promise<unknown> {
      return new Promise((resolve) => {
        this.once(eventName, (event) => {
          resolve(event)
        })
      })
    }

    /**
     * Unregister a callback from an event
     */
    off(eventName: string, callback: Function): this {
      if (!this._emitterEvents.has(eventName)) return null;

      this._emitterEvents
        .get(eventName)
        .forEach((c, i) => {
          if (c === callback) {
            this._emitterEvents.get(eventName).delete(i)
          }
        })

      return this;
    }

    /**
     * Alias for `on`
     */
    addEventListener(eventName: string, callback: Function) {
      return this.on(eventName, callback)
    }

    /**
     * Alias for `off`
     */
    removeEventListener(eventName: string, callback: Function) {
      return this.off(eventName, callback)
    }
  };
}

class Emitter {}
export default ApplyEmitter(Emitter);