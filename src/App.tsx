import { HierarchyNode, stratify } from 'd3-hierarchy'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  getFirestore,
  initializeFirestore,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import TimeAgo from 'react-timeago'
import {
  AuthProvider,
  FirestoreProvider,
  useAuth,
  useFirebaseApp,
  useFirestore,
  useFirestoreCollectionData,
  useUser,
} from 'reactfire'

type AppProps = {
  firestoreCollection: string
  pageId: string
  recaptchaSiteKey?: string
}

function App({ firestoreCollection, pageId, recaptchaSiteKey }: AppProps) {
  const app = useFirebaseApp()
  if (recaptchaSiteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: import.meta.env.PROD,
    })
  }
  const auth = getAuth(app)
  initializeFirestore(app, { ignoreUndefinedProperties: true })
  const firestore = getFirestore(app)
  const pageRef = doc(firestore, firestoreCollection, pageId)
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={firestore}>
          <div className="usapan-container">
            <User />
            <Submit pageRef={pageRef} />
            <Comments pageRef={pageRef} />
          </div>
        </FirestoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

function User() {
  const auth = useAuth()
  const { status, data: user } = useUser()

  if (user === undefined || status === 'loading') {
    return <div className="usapan-loading">Loading user&hellip;</div>
  }

  function handleLogin(e: MouseEvent) {
    e.preventDefault()
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
  }

  function handleLogout(e: MouseEvent) {
    e.preventDefault()
    signOut(auth)
  }

  if (!user) {
    return (
      <div className="usapan-login">
        Join the discussion by{' '}
        <a className="usapan-login-link" href="#" onClick={handleLogin}>
          logging in with Google
        </a>
      </div>
    )
  }

  return (
    <div className="usapan-user">
      Logged in as <strong>{user.displayName}</strong> (
      <a className="usapan-logout-link" href="#" onClick={handleLogout}>
        log out
      </a>
      )
    </div>
  )
}

type CommentsProps = {
  pageRef: DocumentReference
}

type CommentData = {
  id: string
  parentId?: string
  uid: string
  name: string
  timestamp: Timestamp
  text: string
}

function Comments({ pageRef }: CommentsProps) {
  const firestore = useFirestore()
  const commentsRef = collection(
    firestore,
    pageRef.path,
    'comments'
  ) as CollectionReference<CommentData>
  const { status, data: comments } = useFirestoreCollectionData<CommentData>(
    commentsRef,
    {
      idField: 'id',
    }
  )

  if (status === 'loading') {
    return <div className="usapan-loading">Loading comments&hellip;</div>
  }

  const nestedComments = stratify<{ id: string; parentId?: string }>()
    .id((d) => d.id)
    .parentId((d) => d.parentId ?? 'root')([
    { id: 'root', parentId: '' },
    ...comments,
  ])

  return (
    <ul className="usapan-comments">
      {nestedComments.children?.map((comment) => (
        <Comment
          key={comment.id}
          pageRef={pageRef}
          comment={comment as HierarchyNode<CommentData>}
        />
      ))}
    </ul>
  )
}

type CommentProps = {
  pageRef: DocumentReference
  comment: HierarchyNode<CommentData>
}

function Comment({ pageRef, comment }: CommentProps) {
  const { data: user } = useUser()
  const { data, children: replies } = comment
  const { name, timestamp, text } = data

  const [replyShown, setReplyShown] = useState(false)

  function toggleReply(e: MouseEvent) {
    e.preventDefault()
    setReplyShown(!replyShown)
  }

  return (
    <li key={comment.id} className="usapan-comment">
      <div className="usapan-comment-content">
        <div className="usapan-comment-meta">
          <strong className="usapan-comment-name">{name}</strong>
          <time
            className="usapan-comment-timestamp"
            dateTime={timestamp?.toDate().toISOString()}
            title={timestamp?.toDate().toISOString()}
          >
            {timestamp ? <TimeAgo date={timestamp.toDate()} /> : 'moments ago'}
          </time>
        </div>
        <div className="usapan-comment-text">{text}</div>
        {user ? (
          <div className="usapan-comment-reply">
            {replyShown ? (
              <Submit pageRef={pageRef} parentId={comment.id} />
            ) : null}
            <a
              className="usapan-comment-reply-link"
              href="#"
              onClick={toggleReply}
            >
              {replyShown ? 'Discard Reply' : 'Reply'}
            </a>
          </div>
        ) : null}
      </div>
      <ul className="usapan-comments">
        {replies?.map((comment) => (
          <Comment
            key={comment.id}
            pageRef={pageRef}
            comment={comment as HierarchyNode<CommentData>}
          />
        ))}
      </ul>
    </li>
  )
}

type SubmitProps = {
  pageRef: DocumentReference
  parentId?: string
}

function Submit({ pageRef, parentId }: SubmitProps) {
  const { data: user } = useUser()
  const firestore = useFirestore()
  const commentsRef = collection(firestore, pageRef.path, 'comments')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  if (!user) {
    return null
  }

  function handleSubmit(e: JSX.TargetedEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    form.reportValidity()
    const text = form.text.value.trim()
    if (text.length === 0) {
      return
    }
    addDoc(commentsRef, {
      uid: user?.uid,
      parentId,
      name: user?.displayName,
      timestamp: serverTimestamp(),
      text,
    })
    textareaRef.current!.value = ''
  }

  return (
    <form className="usapan-submit" onSubmit={handleSubmit}>
      <textarea
        className="usapan-submit-textarea"
        ref={textareaRef}
        name="text"
        rows={5}
        required
      ></textarea>
      <button type="submit">Submit</button>
    </form>
  )
}

function ErrorFallback({ error }: FallbackProps) {
  return <div className="usapan-error">{error.toString()}</div>
}
