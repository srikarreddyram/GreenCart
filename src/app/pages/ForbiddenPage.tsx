import { Link } from "react-router";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Navbar } from "../components/Navbar";

export function ForbiddenPage() {
  return (
    <div style={{ backgroundColor: "#F5F7F5", minHeight: "100vh" }}>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: "#FCE4EC" }}>
          <ShieldX size={48} color="#C62828" />
        </div>
        <h1 className="text-5xl font-bold mb-3" style={{ color: "#263238" }}>403</h1>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: "#263238" }}>Access Denied</h2>
        <p className="text-lg max-w-md mb-8" style={{ color: "#607D8B" }}>
          You don't have permission to view this page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="flex gap-4">
          <Link
            to="/home"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white no-underline transition-all hover:opacity-90"
            style={{ backgroundColor: "#2E7D32" }}
          >
            <Home size={16} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold no-underline transition-all hover:bg-gray-100"
            style={{ color: "#607D8B", border: "1px solid #E8F0E8", backgroundColor: "#FFFFFF" }}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
