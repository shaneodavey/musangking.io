// src/lib/PageNotFound.jsx
export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-slate-500">
          The page you’re looking for doesn’t exist.
        </p>
      </div>
    </div>
  );
}
