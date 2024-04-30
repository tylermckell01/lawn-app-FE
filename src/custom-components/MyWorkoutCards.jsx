import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function MyWorkoutCards() {
  const [yourWorkoutData, setYourWorkoutData] = useState([]);
  const [yourExerciseData, setYourExerciseData] = useState([]);

  const [editingWorkout, setEditingWorkout] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchWorkoutData();
    fetchExerciseData();
  }, []);

  const fetchWorkoutData = async () => {
    let authToken = Cookies.get("auth_token");
    let userId = Cookies.get("user_id");

    await fetch(`http://127.0.0.1:8086/workouts/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        auth: authToken,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setYourWorkoutData(data.result);
      });
  };

  const fetchExerciseData = async () => {
    let authToken = Cookies.get("auth_token");
    await fetch("http://127.0.0.1:8086/exercises", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        auth: authToken,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setYourExerciseData(data.result);
      });
  };

  const saveEditedWorkout = async () => {
    if (!editingWorkout) {
      return;
    }

    let authToken = Cookies.get("auth_token");

    const { workout_name, description, length } = editingWorkout;

    const updatedWorkoutInfo = { workout_name, description, length };

    const response = await fetch(
      `http://127.0.0.1:8086/workout/${editingWorkout.workout_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          auth: authToken,
        },
        body: JSON.stringify(updatedWorkoutInfo),
      }
    );

    if (response) {
      await fetchExerciseData();
      await fetchWorkoutData();

      setIsEditing(false);

      return response;
    }
  };

  const addExerciseToWorkout = async (workoutId, exerciseId) => {
    let authToken = Cookies.get("auth_token");

    const response = await fetch("http://127.0.0.1:8086/workout/exercise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        auth: authToken,
      },
      body: JSON.stringify({ workout_id: workoutId, exercise_id: exerciseId }),
    })
      .then((res) => res.json())
      .then((data) => data);

    setYourWorkoutData((prevWorkouts) =>
      prevWorkouts.map((workout) =>
        workout.workout_id === workoutId
          ? {
              ...workout,
              exercises: [...workout.exercises, { exercise_id: exerciseId }],
            }
          : workout
      )
    );

    if (response) {
      await fetchWorkoutData();
      await fetchExerciseData();
      return response;
    }
  };

  const deleteWorkout = async () => {
    let authToken = Cookies.get("auth_token");

    const response = await fetch(
      `http://127.0.0.1:8086/workout/delete/${editingWorkout.workout_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          auth: authToken,
        },
      }
    );

    if (response) {
      await fetchWorkoutData();
      return response;
    }
  };

  const editWorkout = (workout) => {
    setEditingWorkout(workout);
    setIsEditing(true);
  };

  const deleteExercise = async (exercise) => {
    let authToken = Cookies.get("auth_token");

    const response = await fetch(`http://127.0.0.1:8086/workout/exercise`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        auth: authToken,
      },
      body: JSON.stringify({
        exercise_id: exercise.exercise_id,
        workout_id: editingWorkout.workout_id,
      }),
    });

    if (response) {
      await fetchWorkoutData();
      return response;
    }
  };

  const renderWorkoutdata = () => {
    if (yourWorkoutData.length === 0) {
      return <div>No workout data available.</div>;
    }

    return yourWorkoutData?.map((workout, idx) => {
      return (
        <div className="workout-info" key={idx}>
          <div className="workout-name">
            {isEditing && editingWorkout.workout_id === workout.workout_id ? (
              <div className="title">
                Workout Name:
                <input
                  type="text"
                  defaultValue={workout.workout_name}
                  onChange={(e) =>
                    setEditingWorkout({
                      ...editingWorkout,
                      workout_name: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="title">Workout Name: {workout.workout_name}</div>
            )}
          </div>
          <div className="workout-description">
            {isEditing && editingWorkout.workout_id === workout.workout_id ? (
              <div className="title">
                Description:
                <input
                  type="text"
                  defaultValue={workout.description}
                  onChange={(e) =>
                    setEditingWorkout({
                      ...editingWorkout,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="title">Description: {workout.description}</div>
            )}
          </div>
          <div className="workout-length">
            {isEditing && editingWorkout.workout_id === workout.workout_id ? (
              <div className="title">
                Length (hrs):
                <input
                  type="text"
                  defaultValue={workout.length}
                  onChange={(e) =>
                    setEditingWorkout({
                      ...editingWorkout,
                      length: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="title">Length (hrs): {workout.length}</div>
            )}
          </div>
          <div className="workout-exercises">
            {workout.exercises.map((exercise, exerciseIdx) => (
              <div key={exerciseIdx}>
                <div className="exercise-name">
                  {isEditing &&
                  editingWorkout.workout_id === workout.workout_id ? (
                    <div>
                      Current Exercises: {exercise.exercise_name}
                      <button onClick={() => deleteExercise(exercise)}>
                        delete
                      </button>
                    </div>
                  ) : (
                    <div className="title">
                      Exercise Name: {exercise.exercise_name}
                    </div>
                  )}
                </div>
                <div className="title">
                  Muscles Worked: {exercise.muscles_worked}
                </div>
              </div>
            ))}
          </div>
          <div className="button-container">
            <button onClick={() => editWorkout(workout)}>edit</button>
          </div>
          {isEditing && editingWorkout.workout_id === workout.workout_id && (
            <div className="edit-modal">
              <div className="title">Add Exercise:</div>
              <select
                onChange={(e) => {
                  setEditingWorkout((prev) => ({
                    ...editingWorkout,
                    exercises: [...prev.exercises, e.target.value],
                  }));
                  addExerciseToWorkout(workout.workout_id, e.target.value);
                }}
              >
                <option value="none"></option>
                {yourExerciseData.map((exercise) => (
                  <option
                    key={exercise.exercise_id}
                    value={exercise.exercise_id}
                  >
                    {/* {editWorkout.exercises} */}

                    {exercise.exercise_name}
                  </option>
                ))}
              </select>
              {isEditing &&
                editingWorkout.workout_id === workout.workout_id && (
                  <button onClick={deleteWorkout}>delete workout</button>
                )}
              <button
                onClick={() => {
                  saveEditedWorkout();
                }}
              >
                save
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="my-workout-cards-container">
      <div className="cards-wrapper">{renderWorkoutdata()}</div>
    </div>
  );
}
