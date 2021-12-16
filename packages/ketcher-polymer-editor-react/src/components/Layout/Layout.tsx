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

import { selectLayoutIsOpened, init, initAsync } from 'state/layout'
import { connect } from 'react-redux'
import classes from './Layout.module.less'

// interface LayoutProps {
//     onOpen: (boolean) => void
//     onOpenAsync: (boolean) => void
//     isOpened: boolean
// }

function PolymerLayout() {
  return (
    <main className={classes.layout}>
      <div className={classes.logo}>
        <span className={classes.firstLine}>POLYMER EDITOR</span>
        <span>
          K<span className={classes.ketcher}>etcher</span>
        </span>
      </div>
    </main>
  )
}

const mapStateToProps = (state) => ({
  isOpened: selectLayoutIsOpened(state)
})

// example actions
const mapDispatchToProps = (dispatch) => ({
  onOpen: (value) => dispatch(init(value)),
  onOpenAsync: (value) => dispatch(initAsync(value))
})

export const Layout = connect(
  mapStateToProps,
  mapDispatchToProps
)(PolymerLayout)
