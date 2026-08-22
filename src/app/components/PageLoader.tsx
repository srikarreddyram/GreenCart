/** Full-page loading state, shared by the router's Suspense boundary and AuthGuard. */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F7F5" }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "#D1E8D1", borderTopColor: "#2E7D32" }}
        />
        <p style={{ color: "#607D8B" }}>Loading GreenCart…</p>
      </div>
    </div>
  );
}
