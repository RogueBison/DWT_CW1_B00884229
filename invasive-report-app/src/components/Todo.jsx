import { useEffect, useRef, useState, useCallback } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import Webcam from "react-webcam";
import { addPhoto, getPhotoSrc } from "../db.jsx";
import Map, { Marker } from "react-map-gl";

function Todo(props) {
  /* console.log(props); */
  const [isEditing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  function handleChange(e) {
    setNewName(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    props.editTask(props.id, newName);
    setNewName("");
    setEditing(false);
  }

  const editingTemplate = (
    <form className="stack-small" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="todo-label" htmlFor={props.id}>
          New name for <h3>{props.name}</h3>
        </label>
        <input
          id={props.id}
          className="todo-text"
          type="text"
          value={newName}
          onChange={handleChange}
        />
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn todo-cancel"
          onClick={() => setEditing(false)}
        >
          Cancel
          <span className="visually-hidden">renaming {props.name}</span>
        </button>
        <button type="submit" className="btn btn__primary todo-edit">
          Save
          <span className="visually-hidden">new name for {props.name}</span>
        </button>
      </div>
    </form>
  );

  const viewTemplate = (
    <div className="stack-small">
      <div className="c-cb">
        <input
          id={props.id}
          type="checkbox"
          defaultChecked={props.completed}
          onChange={() => props.toggleTaskCompleted(props.id)}
        />

        <label className="todo-label" htmlFor={props.id}>
          Name of Report: <span className="report-name">{props.name}</span>
        </label>
      </div>

      <p>{props.description}</p>

      <Map
        mapboxAccessToken="pk.eyJ1IjoibWFydGluLXV3cyIsImEiOiJjbGZpb2Nncjgxc29iM3RuejllZGJtMXNlIn0.xQnKJpu6xPpshPIvozaWqw"
        initialViewState={{
          longitude: props.location.longitude,
          latitude: props.location.latitude,
          zoom: 9,
        }}
        style={{ height: 400 }}
        className="map-width"
        mapStyle="mapbox://styles/mapbox/streets-v9"
      >
        <Marker
          longitude={props.location.longitude}
          latitude={props.location.latitude}
          anchor="bottom"
        >
          <img src="./Map_marker.png" style={{ width: 35, height: 55 }} />
        </Marker>
      </Map>
      <h4>
        Location coordinates: {props.location.longitude},{" "}
        {props.location.latitude}
      </h4>

      <div className="btn-group">
        <button type="button" className="btn" onClick={() => setEditing(true)}>
          Edit <span className="visually-hidden">{props.name}</span>
        </button>
        <Popup
          trigger={
            <button type="button" className="btn">
              {" "}
              Take Photo{""}
            </button>
          }
          modal
        >
          <div>
            <WebcamCapture id={props.id} photoedTask={props.photoedTask} />
          </div>
        </Popup>

        <Popup
          trigger={
            <button type="button" className="btn">
              {" "}
              View Photo{" "}
            </button>
          }
          modal
        >
          <div>
            <ViewPhoto id={props.id} alt={props.name} />
          </div>
        </Popup>
        <button
          type="button"
          className="btn btn__danger"
          onClick={() => props.deleteTask(props.id)}
        >
          Delete <span className="visually-hidden">{props.name}</span>
        </button>
      </div>
      <h5>Report made on {props.timestamp}</h5>
    </div>
  );

  return <li className="todo">{isEditing ? editingTemplate : viewTemplate}</li>;
}

const WebcamCapture = (props) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [imgId, setImgId] = useState(null);
  const [photoSave, setPhotoSave] = useState(false);

  useEffect(() => {
    if (photoSave) {
      console.log("useEffect detected photoSave");
      props.photoedTask(imgId);
      setPhotoSave(false);
    }
  });
  console.log("WebCamCapture", props.id);

  const capture = useCallback(
    (id) => {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      console.log("capture", imageSrc.length, id);
    },
    [webcamRef, setImgSrc]
  );

  const savePhoto = (id, imgSrc) => {
    console.log("savePhoto", id, imgSrc);
    addPhoto(id, imgSrc);
    setImgId(id);
    setPhotoSave(true);
  };

  const cancelPhoto = (id, imgSrc) => {
    console.log("cancelPhoto", id, imgSrc.length, id);
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: { exact: "environment" },
  };

  return (
    <>
      {!imgSrc && (
        <Webcam
          audio={false}
          /* height={720}
          width={1280}
          facingMode={environment} */
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
      )}
      {imgSrc && <img src={imgSrc} />}
      <div className="btn-group">
        {!imgSrc && (
          <button
            type="button"
            className="btn"
            onClick={() => capture(props.id, imgSrc)}
          >
            Capture Photo
          </button>
        )}
        {imgSrc && (
          <button
            type="button"
            className="btn"
            onClick={() => savePhoto(props.id, imgSrc)}
          >
            Save Photo
          </button>
        )}
        {imgSrc && (
          <button
            type="button"
            className="btn todo-cancel"
            onClick={() => cancelPhoto(props.id, imgSrc)}
          >
            Cancel
          </button>
        )}
      </div>
    </>
  );
};

const ViewPhoto = (props) => {
  const photoSrc = getPhotoSrc(props.id);
  return (
    <>
      <div>
        <img src={photoSrc} alt={props.name} />
      </div>
    </>
  );
};

export default Todo;
