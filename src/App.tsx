import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProgressProvider } from "./progress";
import { Home, LessonPage, Missing } from "./pages";
import { Shell } from "./ui";

export function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Home />} />
            <Route path="/leccion/:slug" element={<LessonPage />} />
            <Route path="*" element={<Missing />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  );
}
