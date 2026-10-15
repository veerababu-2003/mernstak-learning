import { useEffect, useState, useMemo } from "react";
import "./App.css";

const VEHICLE_OPTIONS = [
  { type: "Bike", icon: "🏍️", baseFare: 60, desc: "Fastest for 1 person" },
  { type: "Auto", icon: "🛺", baseFare: 110, desc: "Affordable for up to 3" },
  { type: "Cab", icon: "🚗", baseFare: 220, desc: "Comfortable AC ride" },
];

const STATUS_FILTERS = ["All", "Pending", "In Progress", "Completed", "Cancelled"];

function App() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Booking Form State
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [customFare, setCustomFare] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");

  // Fetch all rides
  const fetchRides = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/rides");
      if (!response.ok) {
        throw new Error("Failed to fetch rides from server");
      }
      const data = await response.json();
      setRides(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  // Update Ride Status (e.g. In Progress, Completed, Cancelled)
  const updateRideStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update ride status");
      }

      const updated = await response.json();
      setRides((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete a ride
  const deleteRide = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Ride #${id}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/rides/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ride");
      }

      setRides((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle New Ride Submission
  const handleBookRide = async (e) => {
    e.preventDefault();
    if (!pickup.trim() || !destination.trim()) {
      alert("Please provide both pickup and destination locations.");
      return;
    }

    const selectedConfig = VEHICLE_OPTIONS.find((v) => v.type === vehicleType);
    const finalFare = customFare ? Number(customFare) : selectedConfig?.baseFare || 60;

    setSubmitting(true);
    setBookingSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: pickup.trim(),
          destination: destination.trim(),
          vehicleType,
          fare: finalFare,
          status: "Pending",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create new ride");
      }

      const newRide = await response.json();
      setRides((prev) => [newRide, ...prev]);

      // Reset form
      setPickup("");
      setDestination("");
      setCustomFare("");
      setBookingSuccess(`Ride #${newRide.id} requested successfully!`);
      setTimeout(() => setBookingSuccess(""), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Computed summary metrics
  const stats = useMemo(() => {
    const total = rides.length;
    const pending = rides.filter((r) => r.status === "Pending").length;
    const inProgress = rides.filter((r) => r.status === "In Progress").length;
    const completed = rides.filter((r) => r.status === "Completed").length;
    const cancelled = rides.filter((r) => r.status === "Cancelled").length;
    const revenue = rides
      .filter((r) => r.status === "Completed")
      .reduce((sum, r) => sum + (Number(r.fare) || 0), 0);

    return { total, pending, inProgress, completed, cancelled, revenue };
  }, [rides]);

  // Filtered rides according to search and status pill
  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      const matchesStatus =
        statusFilter === "All" ||
        ride.status.toLowerCase() === statusFilter.toLowerCase();

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ride.pickup.toLowerCase().includes(q) ||
        ride.destination.toLowerCase().includes(q) ||
        (ride.vehicleType && ride.vehicleType.toLowerCase().includes(q)) ||
        ride.id.toString().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [rides, statusFilter, searchTerm]);

  // Vehicle icon helper
  const getVehicleIcon = (type) => {
    switch (type) {
      case "Auto":
        return "🛺";
      case "Cab":
        return "🚗";
      case "Bike":
      default:
        return "🏍️";
    }
  };

  // Status CSS class helper
  const getStatusClass = (status) => {
    switch (status) {
      case "In Progress":
        return "in-progress";
      case "Completed":
        return "completed";
      case "Cancelled":
        return "cancelled";
      case "Pending":
      default:
        return "pending";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>🛵</div>
        <h2>Loading Rapido Ride Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#ef4444" }}>
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button
          onClick={fetchRides}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            background: "#f9c934",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="brand-wrapper">
          <div className="brand-logo">R</div>
          <div>
            <h1 className="brand-title">Rapido Ride Dashboard</h1>
            <p className="brand-subtitle">
              Real-time Fleet & Dispatch Management Console
            </p>
          </div>
        </div>
        <div className="header-status-badge">
          <span className="pulse-dot"></span>
          <span>Live API Connected (:5000)</span>
        </div>
      </header>

      {/* Stats Summary Bar */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Rides</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: "#f59e0b" }}>
            {stats.pending}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value" style={{ color: "#3b82f6" }}>
            {stats.inProgress}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: "#10b981" }}>
            {stats.completed}
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{stats.revenue}</div>
        </div>
      </section>

      {/* Main Grid: Booking Form (Left) & Rides View (Right) */}
      <div className="main-layout">
        {/* Left Column: Book New Ride Form */}
        <aside className="booking-card">
          <h2 className="card-title">
            <span>✨</span> Book / Request Ride
          </h2>

          {bookingSuccess && (
            <div
              style={{
                background: "#d1fae5",
                color: "#065f46",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              ✓ {bookingSuccess}
            </div>
          )}

          <form onSubmit={handleBookRide}>
            <div className="form-group">
              <label className="form-label">Pickup Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Miyapur Metro"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Destination Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hitech City Cyber Towers"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <div className="vehicle-selector">
                {VEHICLE_OPTIONS.map((v) => (
                  <button
                    key={v.type}
                    type="button"
                    className={`vehicle-btn ${
                      vehicleType === v.type ? "active" : ""
                    }`}
                    onClick={() => setVehicleType(v.type)}
                  >
                    <span className="v-icon">{v.icon}</span>
                    <span className="v-name">{v.type}</span>
                    <span className="v-price">₹{v.baseFare}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Custom Fare (Optional ₹)
              </label>
              <input
                type="number"
                className="form-input"
                placeholder={`Default: ₹${
                  VEHICLE_OPTIONS.find((v) => v.type === vehicleType)?.baseFare || 60
                }`}
                value={customFare}
                onChange={(e) => setCustomFare(e.target.value)}
                min="10"
              />
            </div>

            <button
              type="submit"
              className="submit-booking-btn"
              disabled={submitting}
            >
              {submitting ? "Booking..." : "🛵 Confirm & Book Ride"}
            </button>
          </form>
        </aside>

        {/* Right Column: Search, Filter, and Rides List */}
        <main>
          {/* Controls Bar: Search & Status Filter */}
          <div className="controls-card">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search rides by pickup, destination, vehicle, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-pills">
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280" }}>
                Filter:
              </span>
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`filter-pill ${statusFilter === s ? "active" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                  {s === "All"
                    ? ` (${rides.length})`
                    : ` (${rides.filter((r) => r.status.toLowerCase() === s.toLowerCase()).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Rides List */}
          {filteredRides.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📍</div>
              <p className="empty-text">No rides found matching your criteria.</p>
              <p style={{ fontSize: "13px", marginTop: "6px" }}>
                Try adjusting your search terms or filters, or book a new ride.
              </p>
            </div>
          ) : (
            <div className="rides-list">
              {filteredRides.map((ride) => {
                const vehicle = ride.vehicleType || "Bike";
                const icon = getVehicleIcon(vehicle);
                const statusClass = getStatusClass(ride.status);
                const formattedTime = ride.createdAt
                  ? new Date(ride.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <div key={ride.id} className="ride-card">
                    {/* Top Row: Ride ID + Vehicle Badge + Status */}
                    <div className="ride-card-top">
                      <div className="ride-id-badge">
                        <span>Ride #{ride.id}</span>
                        <span className="vehicle-type-tag">
                          {icon} {vehicle}
                        </span>
                        {formattedTime && (
                          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                            • {formattedTime}
                          </span>
                        )}
                      </div>
                      <span className={`status-badge ${statusClass}`}>
                        {ride.status}
                      </span>
                    </div>

                    {/* Route Section */}
                    <div className="route-section">
                      <div className="route-pins">
                        <div className="pin-pickup"></div>
                        <div className="route-line"></div>
                        <div className="pin-drop"></div>
                      </div>
                      <div className="route-details">
                        <div className="route-point">
                          <span className="point-label">Pickup:</span>
                          <span className="point-address">{ride.pickup}</span>
                        </div>
                        <div className="route-point">
                          <span className="point-label">Drop:</span>
                          <span className="point-address">{ride.destination}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Fare + Action Controls */}
                    <div className="ride-card-footer">
                      <div>
                        <span className="fare-display">
                          ₹{ride.fare !== undefined ? ride.fare : 60}
                        </span>
                        <span className="fare-sub"> (Estimated Fare)</span>
                      </div>

                      <div className="action-buttons-group">
                        {/* Dynamic actions based on current status */}
                        {ride.status === "Pending" && (
                          <>
                            <button
                              className="btn-action btn-start"
                              onClick={() => updateRideStatus(ride.id, "In Progress")}
                            >
                              ▶ Start Ride
                            </button>
                            <button
                              className="btn-action btn-cancel"
                              onClick={() => updateRideStatus(ride.id, "Cancelled")}
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )}

                        {ride.status === "In Progress" && (
                          <>
                            <button
                              className="btn-action btn-complete"
                              onClick={() => updateRideStatus(ride.id, "Completed")}
                            >
                              ✓ Complete Ride
                            </button>
                            <button
                              className="btn-action btn-cancel"
                              onClick={() => updateRideStatus(ride.id, "Cancelled")}
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )}

                        {(ride.status === "Completed" || ride.status === "Cancelled") && (
                          <button
                            className="btn-action btn-start"
                            style={{ fontSize: "11px" }}
                            onClick={() => updateRideStatus(ride.id, "In Progress")}
                          >
                            ↺ Reopen
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          className="btn-action btn-delete"
                          onClick={() => deleteRide(ride.id)}
                          title="Delete Ride Record"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;