import { db } from "../lib/firebase";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

export const createUser = async (uid, name, email) => {
    if (uid === "" || name === "" || email === "") {
        console.error("uid, name, or email is not set");
        return;
    }
    try {
        await setDoc(doc(db, "User", uid), {
            name: name,
            email: email,
            date: new Date(),
            color: "red",
        });
    } catch (e) {
        console.log(e);
        setError("Failed to register");
    }
};

export const getUserData = async (uid) => {
    if (uid === "") {
        console.error("uid is not set");
        return;
    }
    const userDoc = doc(db, "User", uid);
    const userDocSnap = await getDoc(userDoc);
    if (userDocSnap.exists()) {
        let data = userDocSnap.data();
        return data;
    } else {
        console.log("No user data found");
        return;
    }
};

export const editUserData = async (uid, user) => {
    if (!uid || !user) {
        console.error("uid or user data is not set");
        return;
    }
    try {
        const userDoc = doc(db, "User", uid);
        await updateDoc(userDoc, { ...user });
    } catch (e) {
        console.error("Error updating user: ", e);
    }
};

export const deleteUserData = async (uid) => {
    try {
        const habitRef = collection(db, "Habit");
        const q = query(habitRef, where("userId", "==", uid));
        const querySnapshot = await getDocs(q);

        const deletePromises = querySnapshot.docs.map(async (doc) => {
            await deleteDoc(doc.ref);
        });

        await Promise.all(deletePromises);

        const userDoc = doc(db, "User", uid);
        await deleteDoc(userDoc);
    } catch (error) {
        console.error("Error deleting user data:", error);
        throw error; // Rethrow the error for higher-level error handling if needed
    }
};

export const getUserHabits = async (uid) => {
    if (uid === "") {
        console.error("uid is not set");
        return;
    }
    const habitRef = collection(db, "Habit");
    const q = query(habitRef, where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const habits = [];
    querySnapshot.forEach((doc) => {
        habits.push(doc.data());
    });
    return habits;
};

export const getUserCurrentHabits = async (uid) => {
    if (uid === "") {
        console.error("uid is not set");
        return;
    }
    const habitRef = collection(db, "Habit");
    const q = query(
        habitRef,
        where("userId", "==", uid),
        where("active", "==", true)
    );
    const querySnapshot = await getDocs(q);
    const habits = [];
    querySnapshot.forEach((doc) => {
        habits.push(doc.data());
    });
    return habits;
};

export const addHabit = async (uid, title, goalUnit, goalNumber, color) => {
    if (uid === "") {
        console.error("uid is not set");
        return;
    }
    const docRef = await addDoc(collection(db, "Habit"), {
        color: color,
        title: title,
        goalNumber: goalNumber,
        goalUnit: goalUnit,
        active: true,
        dateCreated: new Date(),
        userId: uid,
    });
    await updateDoc(docRef, {
        id: docRef.id,
    });
};

export const finishSetup = async (uid, habits, finishCallback) => {
    if (!uid || !habits) {
        console.error("Error: uid or habits are not set");
        return;
    }
    try {
        for (const habit of habits) {
            const { title, goalUnit, goalNumber, color } = habit;
            try {
                await addHabit(uid, title, goalUnit, goalNumber, color);
                console.log(`Habit added: ${title}`);
            } catch (error) {
                console.error(`Error adding habit (${title}):`, error);
            }
        }
        const userDoc = doc(db, "User", uid);
        await updateDoc(userDoc, { isSetup: true });
        finishCallback();
        console.log("isSetup updated successfully");
    } catch (e) {
        console.error("An error occurred during setup: ", e);
    }
};

export const editHabit = async (habitId, habit) => {
    if (!habitId || !habit) {
        console.error("habit id or habit is not set");
        return;
    }
    try {
        const habitDoc = doc(db, "Habit", habitId);
        await updateDoc(habitDoc, { ...habit });
    } catch (e) {
        console.error("Error updating habit: ", e);
    }
};

export const deleteHabit = async (habitId) => {
    if (!habitId) {
        console.error("habit id is not set");
        return;
    }
    try {
        const habitDoc = doc(db, "Habit", habitId);
        await deleteDoc(habitDoc);
    } catch (e) {
        console.error("Error deleting habit: ", e);
    }
};
