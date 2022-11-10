import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import 'url-search-params-polyfill'
import './index.css'
import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container as HTMLElement)
root.render(<App />)
