import { useState, useEffect } from "react";
import axios from "axios";
import "./weather.css";

export default function WeatherDashboard() {
    const [city, setCity] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");

    // Handle change in input
    const handleChange = (e) => {
        setCity(e.target.value);
        if (error) setError(""); // Clear error when typing
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (city.trim() === "") return;

        try {
            const weatherResponse = await axios.get(`http://localhost:5000/api/weather/${city}`);
            if (weatherResponse.data.cod === "404") {
                setError(`City '${city}' not found. Please try again.`);
                setWeatherData(null);
                return;
            }
            setWeatherData(weatherResponse.data);

            // Format the timestamp to MySQL compatible format
            const formattedTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

            await axios.post("http://localhost:5000/api/history", {
                city,
                timestamp: formattedTimestamp,
            });

            fetchHistory();
            setCity("");
        } catch (error) {
            console.error("Error fetching weather data:", error);
            setError("Failed to fetch weather data. Please try again later.");
        }
    };

    // Fetch search history (only last 5 searches)
    const fetchHistory = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/history");
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching search history:", error);
        }
    };

    // Clear all search history
    const handleClearHistory = async () => {
        try {
            await axios.delete("http://localhost:5000/api/history");
            setHistory([]); // Clear state
        } catch (error) {
            console.error("Error clearing search history:", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div className="container">
            <h2 className="title">Weather Dashboard</h2>

            <div className="input-group">
                <input
                    type="text"
                    value={city}
                    placeholder="Enter City Here"
                    onChange={handleChange}
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {weatherData && (
                <div className="weather-info">
                    <h3>Weather in {weatherData.name}</h3>
                    <p>Temperature: {weatherData.main.temp} °C</p>
                    <p>Humidity: {weatherData.main.humidity}%</p>
                    <p>Conditions: {weatherData.weather[0].description}</p>
                </div>
            )}

            {history.length > 0 && (
                <>
                    <div className="history-header">
                        <h3 className="history-title">Last 5 Searches</h3>
                        <button className="clear-button" onClick={handleClearHistory}>
                            Clear All
                        </button>
                    </div>

                    <ul className="history-list">
                        {history.map((item) => (
                            <li key={item.id}>
                                {item.city} - {new Date(item.timestamp).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
