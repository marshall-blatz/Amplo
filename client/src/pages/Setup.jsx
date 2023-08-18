import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import SetHabits from '../components/set-up/SetHabits'
import SetSpecifics from '../components/set-up/SetSpecifics';
import {
  auth,
  registerWithEmailAndPassword, // registerWithEmailAndPassword(name, email, password)
  signInWithGoogle,
} from "../lib/firebase";
import { useMultistepForm } from "../hooks/useMultistepForm";
import { getUserData } from "../interfaces/userInterface";

// FORM FIELDS
// habits : []
//  -- name
//  -- goalNumber
//  -- goalUnit
//  -- color

export default function Setup() {
    const [data, setData] = useState([])
    const [user, loading] = useAuthState(auth);
    const [habits, setHabits] = useState([])
    const navigate = useNavigate()

    const [habitError, setHabitError] = useState("")
    const [specificError, setSpecificError] = useState({
        message:"",
        index:null
    })

    const { step, currentStepIndex, next, back, isLastStep, isFirstStep } = 
    useMultistepForm([
        <SetHabits {...data} habits={habits} setHabits={setHabits} habitError={habitError} setHabitError={setHabitError}/>, 
        <SetSpecifics {...data} habits={habits} setHabits={setHabits} specificError={specificError} setSpecificError={setSpecificError}/>
    ])

    // // if a user is setup and they end up on this route, redirect to "/"
    // useEffect(() => {
    //   if (loading) return;
    //   if (user) {
    //     getUserData(user.uid).then(data => {
    //         if (data.isSetup) navigate("/"); 
    //     })
    //   }
    // }, [user, loading]);

    function onSubmit(e) {
        e.preventDefault();
    
        if (!isLastStep) {
            // makes sure they set habits before they can move onto the set specifics page
            if(habits.length === 0) {
                setHabitError("You must track at least one habit")
                return
            }

            next(); // Advance to the next step
        } else {
            let flag = true
            for (const index in habits) {
                if (!habits[index].goalUnit || !habits[index].goalNumber) {
                    let temp = {};
                    temp.message = "You must set a goal number and unit for each habit";
                    temp.index = index;
                    setSpecificError(temp);
                    flag = false
                    return;
                }
            }
            if(flag){
                setSpecificError({
                    message:"",
                    index:null
                })
            }
    
            // If there are no errors, you can proceed with submission or any other action
            // For now, I'll just log a success message
            console.log(habits);
        }
    }
    

    return (
        <div className="flex justify-center items-center w-full h-screen">
            <form className="flex flex-col bg-b-secondary dark:bg-db-secondary p-10 rounded-lg drop-shadow-md" onSubmit={onSubmit}>
                {step}
                <div className="flex flex-row items-center justify-end">
                    {!isFirstStep && (
                        <button className="mr-4" type="button" onClick={back}>
                            <p>Back</p>
                        </button>
                    )}
                    <button type="submit" className="bg-purple-1 text-white drop-shadow-md py-2 px-4 rounded-md">
                        <p>{isLastStep ? "Complete Setup" : "Set Specifics"}</p>
                    </button>
                </div>
            </form>
        </div>
    );
}
