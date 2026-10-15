const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Sample ride data with vehicle type, fare, and timestamps
let rides = [
  {
    id: 1,
    pickup: "Secunderabad",
    destination: "Gachibowli",
    vehicleType: "Cab",
    fare: 280,
    status: "Completed",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 2,
    pickup: "Miyapur",
    destination: "Hitech City",
    vehicleType: "Bike",
    fare: 75,
    status: "In Progress",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 3,
    pickup: "Kukatpally",
    destination: "Madhapur",
    vehicleType: "Auto",
    fare: 130,
    status: "Pending",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 4,
    pickup: "Banjara Hills",
    destination: "Jubilee Hills",
    vehicleType: "Bike",
    fare: 50,
    status: "Completed",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 5,
    pickup: "Ameerpet",
    destination: "Begumpet",
    vehicleType: "Auto",
    fare: 95,
    status: "Cancelled",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

// Base default fares for vehicle types
const defaultFares = {
  Bike: 60,
  Auto: 110,
  Cab: 220,
};

// API endpoint to get all rides (supports optional ?status=&search= filters)
app.get("/api/rides", (req, res) => {
  const { status, search } = req.query;
  let filtered = [...rides];

  if (status && status !== "All") {
    filtered = filtered.filter(
      (r) => r.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.pickup.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        (r.vehicleType && r.vehicleType.toLowerCase().includes(q))
    );
  }

  res.status(200).json(filtered);
});

// API endpoint to get ride statistics
app.get("/api/rides/stats", (req, res) => {
  const totalRides = rides.length;
  const pending = rides.filter((r) => r.status === "Pending").length;
  const inProgress = rides.filter((r) => r.status === "In Progress").length;
  const completed = rides.filter((r) => r.status === "Completed").length;
  const cancelled = rides.filter((r) => r.status === "Cancelled").length;
  const totalRevenue = rides
    .filter((r) => r.status === "Completed")
    .reduce((sum, r) => sum + (Number(r.fare) || 0), 0);

  res.status(200).json({
    totalRides,
    pending,
    inProgress,
    completed,
    cancelled,
    totalRevenue,
  });
});

// API endpoint to add a new ride
app.post("/api/rides", (req, res) => {
  const { pickup, destination, vehicleType = "Bike", fare, status = "Pending" } = req.body;

  if (!pickup || !destination) {
    return res.status(400).json({ message: "Pickup and Destination are required" });
  }

  const calculatedFare =
    fare !== undefined && fare !== ""
      ? Number(fare)
      : defaultFares[vehicleType] || 60;

  const newRide = {
    id: rides.length > 0 ? Math.max(...rides.map((r) => r.id)) + 1 : 1,
    pickup,
    destination,
    vehicleType,
    fare: calculatedFare,
    status,
    createdAt: new Date().toISOString(),
  };

  rides.unshift(newRide); // Put newest at the top
  res.status(201).json(newRide);
});

// API endpoint to update a ride's status or other details
app.put("/api/rides/:id", (req, res) => {
  const rideId = parseInt(req.params.id);
  const ride = rides.find((r) => r.id === rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  if (req.body.status !== undefined) ride.status = req.body.status;
  if (req.body.pickup !== undefined) ride.pickup = req.body.pickup;
  if (req.body.destination !== undefined) ride.destination = req.body.destination;
  if (req.body.vehicleType !== undefined) ride.vehicleType = req.body.vehicleType;
  if (req.body.fare !== undefined) ride.fare = Number(req.body.fare);

  res.status(200).json(ride);
});

// API endpoint to delete a ride
app.delete("/api/rides/:id", (req, res) => {
  const rideId = parseInt(req.params.id);
  const rideIndex = rides.findIndex((r) => r.id === rideId);

  if (rideIndex === -1) {
    return res.status(404).json({ message: "Ride not found" });
  }

  rides.splice(rideIndex, 1);
  res.status(200).json({ message: "Ride deleted successfully" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});