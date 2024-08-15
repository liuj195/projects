import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import Cookies from "js-cookie";
//used only in dashboard.jsx to scope bootstrap's css to only that component. If we dont do this, the bootstrap css will distort all entire ui
import "./css/conditionalCSS.css";
import "./css/styles.css";
import "./css/uswds/dist/css/uswds.css";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import YK1 from "./js/yk1/yk1";
import "./scripts/yk1SuiteExternalData";
import "./scripts/yk1ErrorMessages";

let cookieToken = Cookies.get("YK1Token");
let cookieUserIP = Cookies.get("UserIP");
let cookieSessionId = Cookies.get("SessionId");
Cookies.remove("YK1Token");
Cookies.remove("UserIP");
Cookies.remove("cookieSessionId");

const ReactIsInDevelomentMode = () => {
  return "_self" in React.createElement("div");
};
//detect if cookie has been set OR if react is in dev mode
if (!cookieToken && !ReactIsInDevelomentMode()) {
  window.location.replace(window.yk1URL);
}
if (!cookieUserIP && !ReactIsInDevelomentMode()) {
  window.location.replace(window.yk1URL);
}

let fields = [];
if (typeof cookieToken !== "undefined" && cookieToken !== null) {
  fields = cookieToken.split("|");
} else {
  fields = ["", ""];
  /*
    $.ajax({
      type: "GET",
      url: "api/yk1/yk1Authenticate",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-SEID": window.seid
      }
    }).then(
      function(data, status, xhr) {
        console.log(xhr.getAllResponseHeaders());
        console.log(data);
        //Y.setToken(xhr.getResponseHeader("X-AUTH-TOKEN"));
        ReactDOM.render(
          <Provider store={store}>
            <App
              token={xhr.getResponseHeader("X-AUTH-TOKEN")}
              seid={window.seid}
              flags={window.application_flags}
              version={window.version}
            />
          </Provider>,
          document.getElementById("root") 
        );
      },
      function(data, status, xhr) {
        //Y.onFail(xhr.status, xhr.statusText);
        alert("yk1Authenticate failed. see console");
        console.log(xhr.status);
        console.log(xhr.statusText);
      }
    );*/
}
console.log(fields);
window.onbeforeunload = function(e) {
  e = e || window.event;
  return "You will lose any unsaved work";
};

window.onunload = function(e) {
  YK1.logOut();
};

//global timer - hard logout at 12 hours per FISMA
//5400000 is 90 min
//43200000 is 12 hours
setTimeout(hardLogout, 43200000);
function hardLogout() {
  window.onbeforeunload = null;
  YK1.logOut();
}

//soft timer set to 25 minutes, controlled in app.js and reset in each ajax call
window.softLogout = function(time) {
  window.start = Date.now();
  window.timerInstance = setTimeout(() => {
    YK1.handleSoftLogout();
  }, time);
};

window.timeElapsed = function() {
  //elapsed time in minutes
  let elapsed = Date.now() - window.start;
  return elapsed;
};

const root = createRoot(document.getElementById("root"));

//ReactDOM.render(
root.render(
  <Provider store={store}>
    <App
      token={fields[0]}
      seid={fields[1]}
      flags={fields[2]}
      version={fields[3]}
      userIP={cookieUserIP}
      sessionId={cookieSessionId}
    />
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
