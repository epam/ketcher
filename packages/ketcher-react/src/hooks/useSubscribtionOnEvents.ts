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

import {useDispatch} from "react-redux";
import {indigoVerification} from "../script/ui/state/request";
import {Ketcher, KetcherAsyncEvents} from "ketcher-core";
import {useEffect} from "react";
import {useAppContext} from "./useAppContext";
import {KETCHER_INIT_EVENT_NAME} from "../constants";

export const useSubscriptionOnEvents = () => {
    const dispatch = useDispatch()

    const { getKetcherInstance } =  useAppContext();
    const loadingHandler = () => {
        dispatch(indigoVerification(true))

    }
    const successHandler = () => {
        dispatch(indigoVerification(false))
    }

    const subscribe = (ketcher:Ketcher) => {

        ketcher.eventBus.addListener(KetcherAsyncEvents.LOADING, loadingHandler)
        ketcher.eventBus.addListener(KetcherAsyncEvents.SUCCESS, successHandler)
        ketcher.eventBus.addListener(KetcherAsyncEvents.FAILURE, successHandler)
    }

    const unsubscribe = (ketcher: Ketcher) => {
        ketcher.eventBus.removeListener(KetcherAsyncEvents.LOADING, loadingHandler)
        ketcher.eventBus.removeListener(KetcherAsyncEvents.SUCCESS, successHandler)
        ketcher.eventBus.removeListener(KetcherAsyncEvents.FAILURE, successHandler)
    }

    const subscribeOnInit = () => {
        subscribe(getKetcherInstance())
    }

    const unsubscribeOnUnMount = () => {
        unsubscribe(getKetcherInstance())
    }

    useEffect(() => {
        window.addEventListener(KETCHER_INIT_EVENT_NAME, () => {
            subscribeOnInit()
        })
        return () => {
            unsubscribeOnUnMount()
            window.removeEventListener(KETCHER_INIT_EVENT_NAME, subscribeOnInit)
        }
    }, [subscribeOnInit, unsubscribeOnUnMount])

}

