import { useEffect, useState } from "react";

function App() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRides() {
      try {
        const response = await fetch("http://localhost:5000/api/rides");

        if (!response.ok) {
          throw new Error("Failed to fetch rides");
        }

        const data = await response.json();
        setRides(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRides();
  }, []);

  const updateRideStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rides/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update ride status");
      }

      const updatedRide = await response.json();
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride.id === updatedRide.id ? updatedRide : ride
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteRide = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rides/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ride");
      }

      setRides((prevRides) => prevRides.filter((ride) => ride.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <h2>Loading rides...</h2>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Rapido Ride Dashboard</h1>

      {rides.map((ride) => (
        <div
          key={ride.id}
          style={{
            border: "1px solid #ccc",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>Ride #{ride.id}</h3>
          <p>Pickup: {ride.pickup}</p>
          <p>Destination: {ride.destination}</p>
          <p>Status: {ride.status}</p>
          <button
            onClick={() => updateRideStatus(ride.id, "Completed")}
            style={{
              marginRight: "10px",
              padding: "6px 12px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Mark as Completed
          </button>
          <button
            onClick={() => deleteRide(ride.id)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Delete Ride
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;