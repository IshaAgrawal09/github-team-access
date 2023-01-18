import "@cedcommerce/ounce-ui/dist/index.css";
import "./App.css";
import Main from "./components/Main";

function App() {
  return (
    <div className="App">
      <Main perPage={2} />
    </div>
  );
}

export default App;
