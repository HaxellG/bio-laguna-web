import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './views/layouts/MainLayout';
import DashboardPage from './views/pages/Dashboard/DashboardPage';
import ChatPage from './views/pages/Chat/ChatPage';
import AboutPage from './views/pages/About/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
