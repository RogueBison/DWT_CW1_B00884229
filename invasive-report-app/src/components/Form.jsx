import { useState, useEffect } from "react";
export default function Form(props) {
  const [name, setName] = useState("");
  const [addition, setAddition] = useState(false);
  useEffect(() => {
    if (addition) {
      console.log("useEffect detected addition");
      props.geoFindMe();
      setAddition(false);
    }
  });
  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    setAddition(true);
    props.addTask(name);
    setName("");
  }

  function handleChange() {
    setName(event.target.value);
    console.log(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="label-wrapper">
        <label htmlFor="new-todo-input" className="label__lg">
          Make a report here:
        </label>
      </h2>

      <input
        type="text"
        id="new-todo-input"
        className="input input__lg"
        name="text"
        autoComplete="off"
        value={name}
        onChange={handleChange}
      />

      <button type="submit" className="btn btn__primary btn__lg">
        Submit Report
      </button>
    </form>
  );
}
