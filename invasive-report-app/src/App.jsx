import { useState } from "react";
import { useEffect } from "react";
import { nanoid } from "nanoid";
import Popup from "reactjs-popup";
import moment from "moment";
import Todo from "./components/Todo";
import Form from "./components/Form";
import "./styles.css";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const [reports, setReports] = usePersistedState("reports", []);
  const [checkedReports, setCheckedReports] = useState([]);
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
    console.log(`Latitude: ${latitude}°, Longitude: ${longitude}°`);
    locateReport(lastInsertedId, {
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

  function toggleReportChecked(id) {
    setCheckedReports((prevCheckedReports) =>
      prevCheckedReports.includes(id)
        ? prevCheckedReports.filter((reportId) => reportId !== id)
        : [...prevCheckedReports, id]
    );
  }

  function deleteReport(close) {
    const remainingReports = reports.filter(
      (report) => !checkedReports.includes(report.id)
    );
    setReports(remainingReports);
    setCheckedReports([]);
    close();
  }

  function editReport(id, newName, newDescription) {
    const editedReportList = reports.map((report) => {
      if (id === report.id) {
        return { ...report, name: newName, description: newDescription };
      }
      return report;
    });
    setReports(editedReportList);
  }

  function locateReport(id, location) {
    const locatedReportList = reports.map((report) => {
      if (id === report.id) {
        return { ...report, location: location };
      }
      return report;
    });
    setReports(locatedReportList);
  }

  const reportList = reports.map((report) => (
    <Todo
      id={report.id}
      name={report.name}
      description={report.description}
      timestamp={report.timestamp}
      key={report.id}
      location={report.location}
      photoedReport={photoedReport}
      deleteReport={deleteReport}
      editReport={editReport}
      isChecked={checkedReports}
      toggleReportChecked={toggleReportChecked}
    />
  ));

  function addReport(name, description) {
    const id = "report-" + nanoid();
    const timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");
    const newReport = {
      id: id,
      name: name,
      description: description,
      location: { latitude: "##", longitude: "##", error: "##" },
      timestamp: timestamp,
    };
    setLastInsertedId(id);
    setReports([...reports, newReport]);
  }

  const createdNoun = reportList.length !== 1 ? "reports" : "report";
  const reportsMade = `You've made ${reportList.length} ${createdNoun}`;

  const checkedNoun = checkedReports.length > 1 ? "reports" : "report";
  const reportsChecked = `You're about to delete ${checkedReports.length} ${checkedNoun}`;

  function photoedReport(id) {
    console.log("photoedReport", id);
    const photoedReportList = reports.map((report) => {
      if (id === report.id) {
        return { ...report, photo: true };
      }
      return report;
    });
    console.log(photoedReportList);
    setReports(photoedReportList);
  }

  return (
    <div className="todoapp stack-large">
      <h3>Use this app to report an invasive species in Scotland.</h3>
      <p>
        You can create a post describing the animal you've seen that you believe
        to be invasive. Enabling <i>'location'</i> on you device will allow you
        to record the geolocation of where you've made the report.
      </p>

      <Form addReport={addReport} geoFindMe={geoFindMe} />

      <h4>Reports selected: {checkedReports.length}</h4>

      <Popup
        trigger={
          <button type="button" className="btn btn__danger btn__lg">
            Delete
          </button>
        }
        modal
        closeOnDocumentClick={false}
      >
        {(close) => (
          <div className="popup">
            <h2>{reportsChecked}</h2>
            <p>Are you sure you want to continue?</p>
            <div className="btn-group">
              <button className="btn" onClick={() => deleteReport(close)}>
                Proceed
              </button>
              <button className="btn" onClick={close}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Popup>

      <h2 id="list-heading">{reportsMade}</h2>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        {reportList}
      </ul>
    </div>
  );
}

export default App;
