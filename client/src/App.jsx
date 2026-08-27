import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Student Pages
import StudentHome from './pages/student/StudentHome';
import StudentPresentation from './pages/student/StudentPresentation';

// Teacher Pages
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MakePresentation from './pages/teacher/MakePresentation';
import TopicManagement from './pages/teacher/TopicManagement';
import OpenPresentations from './pages/teacher/OpenPresentations';
import LockedPresentations from './pages/teacher/LockedPresentations';
import PresentationResults from './pages/teacher/PresentationResults';

function App() {
  return (
    <Routes>
      {/* Public Student Routes */}
      <Route path="/" element={<StudentHome />} />
      <Route path="/student/presentation/:id" element={<StudentPresentation />} />

      {/* Public Teacher Login */}
      <Route path="/teacher/login" element={<TeacherLogin />} />

      {/* Protected Faculty Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/make-presentation" element={<MakePresentation />} />
        <Route path="/teacher/open-presentations" element={<OpenPresentations />} />
        <Route path="/teacher/locked-presentations" element={<LockedPresentations />} />
        <Route path="/teacher/presentation/:id" element={<TopicManagement />} />
        <Route path="/teacher/presentation/:id/results" element={<PresentationResults />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
