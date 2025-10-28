import Routers from "./router/Router.jsx";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routers />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
