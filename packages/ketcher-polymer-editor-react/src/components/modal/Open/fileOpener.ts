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

export function fileOpener() {
  return new Promise((resolve, reject) => {
    if (global.FileReader) {
      resolve(throughFileReader)
    } else {
      reject(new Error('Your browser does not support opening files locally'))
    }
  })
}

function throughFileReader(file) {
  return new Promise((resolve, reject) => {
    const rd = new FileReader()

    rd.onload = () => {
      const content = rd.result
      if (file.msClose) file.msClose()
      resolve(content)
    }

    rd.onerror = (event) => {
      reject(event)
    }

    rd.readAsText(file, 'UTF-8')
  })
}
