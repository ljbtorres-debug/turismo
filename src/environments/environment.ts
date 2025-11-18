// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyAYriBrhAf7rHb7V0u-UW6GsGdzhn7Qno0",
    authDomain: "produc-admin-j.firebaseapp.com",
    projectId: "produc-admin-j", // ← CORREGIDO: era "produc-admin-jtk"
    storageBucket: "produc-admin-j.firebasestorage.app",
    messagingSenderId: "556055499753",
    appId: "1:556055499753:web:3581b06e7ec7e98a1af178"
  }

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
