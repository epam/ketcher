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

import classes from './App.module.less'
import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'state'
import { selectEditorIsReady, fetchInitData } from 'state/common'

export const fetchData = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve('some data'), 1000)
  })

export const App = (): React.ReactElement => {
  const dispatch = useAppDispatch()
  const isReady = useAppSelector(selectEditorIsReady)

  useEffect(() => {
    dispatch(fetchInitData())
  }, [dispatch])

  if (!isReady) {
    return <div>App is not ready</div>
  }

  return (
    <div className={classes.container}>
      <div className={classes.logo}>
        <span>Polymer Editor</span>
        <span>Ketcher</span>
        <span>EPAM</span>
      </div>
    </div>
  )
}
