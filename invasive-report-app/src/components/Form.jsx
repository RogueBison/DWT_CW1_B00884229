import { useState, useEffect } from "react";
export default function Form(props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
    props.addTask(name, description);
    setName("");
    setDescription("");
  }

  function handleNameChange() {
    setName(event.target.value);
    console.log(event.target.value);
  }

  function handleDescChange() {
    setDescription(event.target.value);
    console.log(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="label-wrapper">
        <label htmlFor="new-todo-name" className="label__lg">
          Enter a name for new report:
        </label>
      </h2>

      <input
        type="text"
        id="new-todo-name"
        className="input input__lg"
        name="text"
        autoComplete="off"
        value={name}
        onChange={handleNameChange}
      />

      <h2 className="label-wrapper">
        <label htmlFor="new-todo-desc" className="label__lg">
          Enter a description of what you've seen:
        </label>
      </h2>
      <input
        type="textarea"
        id="new-todo-desc"
        className="input input__lg"
        name="textarea"
        autoComplete="off"
        value={description}
        onChange={handleDescChange}
      />

      <button type="submit" className="btn btn__primary btn__lg">
        Submit Report
      </button>
    </form>
  );
}
