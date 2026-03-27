import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GalleryPage from './pages/GalleryPage';
import CustomizerPage from './pages/CustomizerPage';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/customize/:modelId" element={
            <ErrorBoundary>
              <CustomizerPage />
            </ErrorBoundary>
          } />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
