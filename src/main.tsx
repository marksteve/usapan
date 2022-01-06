import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

export default function usapan(el: HTMLElement) {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    el
  )
}
