import { useState } from "react";
import { useEffect } from "react";
import { nanoid } from "nanoid";
import moment from "moment";
import Todo from "./components/Todo";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import "./styles.css";
import "mapbox-gl/dist/mapbox-gl.css";

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

function App() {
  const [tasks, setTasks] = usePersistedState("tasks", []);
  const [filter, setFilter] = useState("All");
  const [lastInsertedId, setLastInsertedId] = useState("");

  const geoFindMe = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
    } else {
      console.log("Locating…");
      navigator.geolocation.getCurrentPosition(success, error);
    }
  };

  const success = (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log(latitude, longitude);
    console.log(`Latitude: ${latitude}°, Longitude: ${longitude}°`);
    console.log(
      `Try here: https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`
    );
    locateTask(lastInsertedId, {
      latitude: latitude,
      longitude: longitude,
      error: "",
    });
  };

  const error = () => {
    console.log("Unable to retrieve your location");
  };

  function usePersistedState(key, defaultState) {
    const [state, setState] = useState(
      () => JSON.parse(localStorage.getItem(key)) || defaultState
    );

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
  }

  function toggleTaskCompleted(id) {
    const updatedTasks = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        // use object spread to make a new object
        // whose `completed` prop has been inverted
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function deleteTask(id) {
    const remainingTasks = tasks.filter((task) => id !== task.id);
    setTasks(remainingTasks);
  }

  function editTask(id, newName, newDescription) {
    const editedTaskList = tasks.map((task) => {
      if (id === task.id) {
        return { ...task, name: newName, description: newDescription };
      }
      return task;
    });
    setTasks(editedTaskList);
  }

  function locateTask(id, location) {
    console.log("locate Task", id, " before");
    console.log(location, tasks);
    const locatedTaskList = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        //
        return { ...task, location: location };
      }
      return task;
    });
    console.log(locatedTaskList);
    setTasks(locatedTaskList);
  }

  const taskList = tasks
    ?.filter(FILTER_MAP[filter])
    .map((task) => (
      <Todo
        id={task.id}
        name={task.name}
        description={task.description}
        timestamp={task.timestamp}
        completed={task.completed}
        key={task.id}
        location={task.location}
        toggleTaskCompleted={toggleTaskCompleted}
        photoedTask={photoedTask}
        deleteTask={deleteTask}
        editTask={editTask}
      />
    ));

  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  function addTask(name, description) {
    const id = "report-" + nanoid();
    const timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");
    const newTask = {
      id: id,
      name: name,
      description: description,
      completed: false,
      location: { latitude: "##", longitude: "##", error: "##" },
      timestamp: timestamp,
    };
    setLastInsertedId(id);
    setTasks([...tasks, newTask]);
  }

  const reportsNoun = taskList.length !== 1 ? "reports" : "report";
  const headingText = `You've made ${taskList.length} ${reportsNoun}`;

  function photoedTask(id) {
    console.log("photoedTask", id);
    const photoedTaskList = tasks.map((task) => {
      // if this task has the same ID as the edited task
      if (id === task.id) {
        //
        return { ...task, photo: true };
      }
      return task;
    });
    console.log(photoedTaskList);
    setTasks(photoedTaskList);
  }

  return (
    <div className="todoapp stack-large">
      <h3>Use this app to report an invasive species in Scotland.</h3>
      <p>
        You can create a post describing the animal you've seen that you believe
        to be invasive. Enabling <i>'location'</i> on you device will allow you
        to record the geolocation of where you've made the report.
      </p>

      <Form addTask={addTask} geoFindMe={geoFindMe} />

      <div className="filters btn-group stack-exception">{filterList}</div>

      <h2 id="list-heading">{headingText}</h2>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        {taskList}
      </ul>
    </div>
  );
}

export default App;
