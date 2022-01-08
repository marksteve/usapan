# Usapan
A no-frills commenting system using Firestore.

## Usage
1. Set up a Firebase project
2. Enable the Google sign-in provider
3. Set up Firestore security rules. Check out firestore.rules.example in the repository.
4. Add a web app to the project and note its config
5. Add the following code in your page:

    ```
    <script type="module">
    import usapan from 'https://unpkg.com/usapan@0.0.1/dist/usapan.es.js'
    usapan({
      el: document.querySelector('#comments'), // Element to render comments 
      firebaseConfig: { ... },                 // Your Firebase config
      firestoreCollection: 'usapan',           // Root Firestore collection
      pageId: 'my-page',                       // Unique page identifier
    })
    </script>
    ```
6. Optional: Load the default stylesheet:

    ```
    <link href="https://unpkg.com/usapan@0.0.1/dist/style.css" rel="stylesheet" />
    ```