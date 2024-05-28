/* eslint-disable react/prop-types */
import { useEffect, useRef, useState, useCallback } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import Webcam from "react-webcam";
import { addPhoto, getPhotoSrc } from "../db.jsx";
import Map, { Marker } from "react-map-gl";

function Report(props) {
  const [isEditing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isLocated, setLocated] = useState(false);

  useEffect(() => {
    if (props.location.latitude !== "##" && props.location.longitude !== "##") {
      setLocated(true);
    }
  }, [props.location.latitude, props.location.longitude]);

  function handleNameChange(e) {
    setNewName(e.target.value);
  }

  function handleDescChange(e) {
    setNewDesc(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    props.editReport(props.id, newName, newDesc);
    setNewName("");
    setNewDesc("");
    setEditing(false);
  }

  const MAPBOX_TOKEN =
    "pk.eyJ1IjoibWFydGluLXV3cyIsImEiOiJjbGZpb2Nncjgxc29iM3RuejllZGJtMXNlIn0.xQnKJpu6xPpshPIvozaWqw";

  const editingTemplate = (
    <form className="stack-small" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="todo-label" htmlFor={props.id}>
          Edit name for report:{" "}
          <span className="report-name">{props.name}</span>
        </label>
        <input
          id={props.id}
          className="todo-text"
          type="text"
          value={newName}
          onChange={handleNameChange}
        />
      </div>
      <div className="form-group">
        <label className="todo-label" htmlFor={props.id}>
          Edit description:
        </label>
        <input
          id={props.id}
          className="todo-text"
          type="text"
          value={newDesc}
          onChange={handleDescChange}
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
          <span className="visually-hidden">
            new name and description for {props.name}
          </span>
        </button>
      </div>
    </form>
  );

  const viewTemplate = (
    <div className="stack-small">
      <div className="c-cb">
        <input
          type="checkbox"
          onChange={() => props.toggleReportChecked(props.id)}
        />

        <label className="todo-label" htmlFor={props.id}>
          Name of Report: <span className="report-name">{props.name}</span>
        </label>
      </div>

      <p>{props.description}</p>

      {isLocated && (
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: props.location.longitude,
            latitude: props.location.latitude,
            zoom: 6,
            pitch: 48,
          }}
          style={{ height: 400 }}
          className="map-width"
          mapStyle="mapbox://styles/mapbox/dark-v11"
        >
          <Marker
            longitude={props.location.longitude}
            latitude={props.location.latitude}
            anchor="bottom"
          >
            {/* <img src="./Map_marker.png" style={{ width: 35, height: 55 }} /> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="#b91c1c"
            >
              <path d="M12 2c2.131 0 4 1.73 4 3.702 0 2.05-1.714 4.941-4 8.561-2.286-3.62-4-6.511-4-8.561 0-1.972 1.869-3.702 4-3.702zm0-2c-3.148 0-6 2.553-6 5.702 0 3.148 2.602 6.907 6 12.298 3.398-5.391 6-9.15 6-12.298 0-3.149-2.851-5.702-6-5.702zm0 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm4 14.5c0 .828-1.79 1.5-4 1.5s-4-.672-4-1.5 1.79-1.5 4-1.5 4 .672 4 1.5z" />
            </svg>
          </Marker>
        </Map>
      )}

      <p>
        Coordinates: {props.location.longitude}, {props.location.latitude}
      </p>

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
            <WebcamCapture id={props.id} photoedReport={props.photoedReport} />
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
      </div>
      <h5>Reported on {props.timestamp}</h5>
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
      props.photoedReport(imgId);
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
    width: 300,
    height: 300,
    facingMode: { exact: "environment" },
  };

  return (
    <>
      {!imgSrc && (
        <Webcam
          audio={false}
          /* height={740}
          width={360}
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

export default Report;
