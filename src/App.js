import "@cedcommerce/ounce-ui/dist/index.css";
import { useEffect, useState } from "react";
import "./App.css";
import Main from "./components/Main";

function App() {
  const showTabs = [
    {
      id: "members",
      content: "Members",
    },
    {
      id: "teams",
      content: "Teams",
    },
    {
      id: "repositories",
      content: "Repositories",
    },
  ];

  return (
    <div className="App">
      <Main showTabs={showTabs} />
    </div>
  );
}

export default App;
