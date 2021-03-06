# Usapan
A no-frills comments widget powered by Firebase

_Usapan is the Filipino word for discussion_

## Features
- Unstyled
- Serverless
- Nested comments
- Abuse protection through [App Check](https://firebase.google.com/docs/app-check)

## Usage
1. Set up a Firebase project.
2. Enable the Google sign-in provider.
3. Set up Firestore security rules. Check out `firestore.rules.example` in the repository.
4. Add a web app to the project and note its config.
5. (Optional) [Set up App Check](https://firebase.google.com/docs/app-check/web/recaptcha-provider) from the Firebase console. You don't need to do step 3. The widget initializes App Check if you supply the reCAPTCHA site key.
6. Add the following code in your page:

    ```
    <script type="module">
      import usapan from 'https://unpkg.com/usapan@0.2.0/dist/usapan.es.js'
      usapan({
        el: document.querySelector('#comments'), // Element to render comments 
        firebaseConfig: { ... },                 // Your Firebase config
        firestoreCollection: 'usapan',           // Root Firestore collection
        pageId: 'my-page',                       // Unique page identifier
        recaptchaSiteKey: '...',                 // reCAPTCHA v3 site key for App Check
      })
    </script>
    ```
7. (Optional) Load the default stylesheet:

    ```
    <link href="https://unpkg.com/usapan@0.2.0/dist/style.css" rel="stylesheet" />
    ```

## Todo

- [x] Permalinks
- [ ] Reactions
- [ ] Anonymous mode
- [ ] Reduce bundle size
  - [x] Switch from React to Preact
  - [ ] Add Cloudflare as alternative storage option
- [ ] Moderation

## Demo

[https://usapan.marksteve.com](https://usapan.marksteve.com)

## Development


```
npm i
npm run dev
```

## Release

```
npm version <major|minor|patch>
npm publish
```

Example page is automatically deployed on merge to main.