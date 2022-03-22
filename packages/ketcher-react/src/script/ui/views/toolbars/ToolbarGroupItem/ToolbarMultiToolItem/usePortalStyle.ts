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

import { CSSProperties, RefObject, useEffect, useState } from 'react'

type HookParams = [RefObject<HTMLDivElement>, boolean]

function usePortalStyle([ref, isOpen]: HookParams): [CSSProperties] {
  const [portalStyle, setPortalStyle] = useState<CSSProperties>({})

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const editorRect = document
      .querySelector('.Ketcher-root')
      ?.getBoundingClientRect() || { top: 0, left: 0 }
    const menuItemRect = ref.current.getBoundingClientRect()

    const top = menuItemRect.top - editorRect.top
    const spaceBetween = 4
    const left =
      menuItemRect.left - editorRect.left + menuItemRect.width + spaceBetween

    setPortalStyle({ top: `${top}px`, left: `${left}px` })
  }, [ref, isOpen])

  return [portalStyle]
}

export { usePortalStyle }
