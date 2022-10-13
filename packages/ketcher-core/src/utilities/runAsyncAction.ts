/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import EventEmitter from "events";

export enum KetcherAsyncEvents {
    LOADING = "LOADING",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE"
}

export const runAsyncAction = async <T = any> (action: () => Promise<T>, eventEmitter: EventEmitter): Promise<T | undefined> => {
    eventEmitter.emit(KetcherAsyncEvents.LOADING)
    try {
        const res = await action();
        eventEmitter.emit(KetcherAsyncEvents.SUCCESS)
        return res
    } catch {
        eventEmitter.emit(KetcherAsyncEvents.FAILURE)
        return undefined
    }

}