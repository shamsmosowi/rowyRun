import { updateConfig, getProjectId } from "./utils";
import { db } from "../firebaseConfig";
import { logError } from "./createRowyApp";
import inquirer from "inquirer";
const projectId = getProjectId();
const publicSettings = {
  signInOptions: ["google"],
};
const settings = {
  rowyRunBuildStatus: "BUILDING",
  rowyRunRegion: process.env.GOOGLE_CLOUD_REGION,
};

const initFirestore = async () => {
  await db.doc("_rowy_/settings").set(settings, { merge: true });
  await db.doc("_rowy_/publicSettings").set(publicSettings, { merge: true });
};
const confirmFirestoreIsInitialised = async () => {
  try {
    await initFirestore();
  } catch (error) {
    inquirer.prompt([
      {
        type: "confirm",
        name: "firestore",
        message:
          "Firestore is not initialized. please insure it has been initialized before starting",
      },
    ]);
    return await confirmFirestoreIsInitialised();
  }
};

async function start() {
  try {
    if (!projectId) {
      throw new Error("GOOGLE_CLOUD_PROJECT env variable is not set");
    }

    try {
      await initFirestore();
    } catch (error) {
      await confirmFirestoreIsInitialised();
    }
    updateConfig("projectId", projectId);
  } catch (error) {
    console.log(error);
    logError({
      event: "pre-build",
      error,
    });
  }
}

start();
