# Argupedia front end

## Set up, install and run

`git clone https://github.com/alhabibhasan/argupedia-backend.git`

`cd argupedia-backend; npm install; npm start`

## Firebase set up

You will need to set up and connect to your own instance of firebase. Steps to do this can be found here: https://firebase.google.com/

You will need to add the credentials into the ```admin/firebase/auth/firebase.js``` file.

Your firebase instance will need to have auth and realtime DB enabled.

### Auth

We require at least email and password and Google authentication to be enabled via the Firebase Auth panel.

Please ensure this has been setup. You can find steps here: https://firebase.google.com/docs/auth/web/password-auth. This link will show you how to enable email and password auth, it will contain links to enabling Google authentication as well.

### Realtime DB

You must also set up a realtime Database instance. Steps to create your own firebase realtime database instance can be found here: https://firebase.google.com/docs/database/web/start

Only add data to the realtime DB via the Admin panel accessed via the back end app. This will mean that the react app will be able to read the data in the correct way.


## Neo4j Database Setup

In order to use the app, you will need to download and install a Neo4j database instance onto your machine.

You can find instructions on how to do this here:
https://neo4j.com/docs/operations-manual/current/installation/

Once you have install Neo4j onto your machine, you will need to create a new graph instance. This can be done via the Neo4j Desktop browser.

After you do this, please update the ```.env``` with the specific details of your database graph.

This will allow Argupedia to connect to the database.

Argupedia will handle the structure of the data within the graph itself.

## Running tests

In order to run tests, you will need to ensure that you have set up a separate test database graph. You can do this by repeating the steps from the previous step and setting the values within the ```.env.test```.

Once you have created database graph and have updated the ```.env.test``` file, close all active instances of the app. Then run:

```npm test```

This will run tests and generate code coverage documentation. This can be found and explored by opening the ```coverage/index.html``` in a browser window.
