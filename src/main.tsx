import { render } from 'preact'
import { FirebaseAppProvider } from 'reactfire'
import App from './App'
import './default.css'

type UsapanConfig = {
  el: HTMLElement
  firebaseConfig: any
  firestoreCollection: string
  pageId: string
  recaptchaSiteKey?: string
}

export default function usapan({
  el,
  firebaseConfig,
  ...config
}: UsapanConfig) {
  render(
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <App {...config} />
    </FirebaseAppProvider>,
    el
  )
}
