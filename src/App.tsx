import { HierarchyNode, stratify } from 'd3-hierarchy'
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
import React, { useEffect, useRef, useState } from 'react'
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
  postId: string
}

serverTimestamp

function App({ firestoreCollection, postId }: AppProps) {
  const app = useFirebaseApp()
  const auth = getAuth(app)
  initializeFirestore(app, { ignoreUndefinedProperties: true })
  const firestore = getFirestore(app)
  const postRef = doc(firestore, firestoreCollection, postId)
  return (
    <AuthProvider sdk={auth}>
      <FirestoreProvider sdk={firestore}>
        <div className="usapan-container">
          <User />
          <Submit postRef={postRef} />
          <Comments postRef={postRef} />
        </div>
      </FirestoreProvider>
    </AuthProvider>
  )
}

export default App

function User() {
  const auth = useAuth()
  const { status, data: user } = useUser()

  if (user === undefined || status === 'loading') {
    return <div className="usapan-loading">Loading&hellip;</div>
  }

  function handleLogin(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
  }

  function handleLogout(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    signOut(auth)
  }

  if (!user) {
    return (
      <div className="usapan-login">
        Start the discussion by{' '}
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
  postRef: DocumentReference
}

type CommentData = {
  id: string
  parentId?: string
  uid: string
  name: string
  timestamp: Timestamp
  text: string
}

function Comments({ postRef }: CommentsProps) {
  const firestore = useFirestore()
  const commentsRef = collection(
    firestore,
    postRef.path,
    'comments'
  ) as CollectionReference<CommentData>
  const { status, data: comments } = useFirestoreCollectionData<CommentData>(
    commentsRef,
    {
      idField: 'id',
    }
  )

  if (status === 'loading') {
    return <div className="usapan-loading">Loading&hellip;</div>
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
          postRef={postRef}
          comment={comment as HierarchyNode<CommentData>}
        />
      ))}
    </ul>
  )
}

type CommentProps = {
  postRef: DocumentReference
  comment: HierarchyNode<CommentData>
}

function Comment({ postRef, comment }: CommentProps) {
  const { data: user } = useUser()
  const { data, children: replies } = comment
  const { name, timestamp, text } = data

  const [replyShown, setReplyShown] = useState(false)

  function toggleReply(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    setReplyShown(!replyShown)
  }

  return (
    <li key={comment.id} className="usapan-comment">
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
            <Submit postRef={postRef} parentId={comment.id} />
          ) : null}
          <a href="#" onClick={toggleReply}>
            {replyShown ? 'Cancel' : 'Reply'}
          </a>
        </div>
      ) : null}
      <ul className="usapan-comments">
        {replies?.map((comment) => (
          <Comment
            key={comment.id}
            postRef={postRef}
            comment={comment as HierarchyNode<CommentData>}
          />
        ))}
      </ul>
    </li>
  )
}

type SubmitProps = {
  postRef: DocumentReference
  parentId?: string
}

function Submit({ postRef, parentId }: SubmitProps) {
  const { data: user } = useUser()
  const firestore = useFirestore()
  const commentsRef = collection(firestore, postRef.path, 'comments')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  if (!user) {
    return null
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
  }

  return (
    <form className="usapan-form" onSubmit={handleSubmit}>
      <textarea ref={textareaRef} name="text" required></textarea>
      <button type="submit">Submit</button>
    </form>
  )
}
