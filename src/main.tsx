import React from 'react'
import ReactDOM from 'react-dom'
import { FirebaseAppProvider } from 'reactfire'
import App from './App'

type UsapanConfig = {
  el: HTMLElement
  firebaseConfig: any
  firestoreCollection: string
  postId: string
}

export default function usapan({
  el,
  firebaseConfig,
  ...config
}: UsapanConfig) {
  ReactDOM.render(
    <React.StrictMode>
      <FirebaseAppProvider firebaseConfig={firebaseConfig}>
        <App {...config} />
      </FirebaseAppProvider>
    </React.StrictMode>,
    el
  )
}
