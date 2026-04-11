import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";
import { TalentPoolPage } from "@/pages/TalentPoolPage";
import { ProjectPage } from "@/pages/ProjectPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/talent" element={<TalentPoolPage />} />
          <Route path="/projects" element={<ProjectPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
