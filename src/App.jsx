import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [today] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate the next 7 days
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const next7Days = getNext7Days();

  // Fetch availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://4vi4moejhi.execute-api.eu-north-1.amazonaws.com/api/availability'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch availability data');
        }
        const data = await response.json();
        setAvailability(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  return (
    <div className="App">
  <h1>This Week's Tennis Schedule</h1>
  <div className="calendar">
    {next7Days.map((date, index) => (
      <div key={index} className="calendar-day">
        <p>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'numeric', day: 'numeric' })}</p>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          Object.entries(
          availability
            .filter(
              (slot) =>
                slot.date === date.toISOString().split('T')[0].replace(/-/g, '')
            ).sort((a, b) => a.start - b.start)
            .reduce((acc, slot) => {
              acc[slot.start] = acc[slot.start] || [];
              acc[slot.start].push(slot);
              return acc;
            }, {})
          ).map(([startTime, slots], i) => (
            <div key={i} className="time-group">
            {slots.map((slot, j) => (
              <a
                key={j}
                href={slot.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`event-block ${j === 0 && slots.length > 1 ? 'small-first-block' : ''}`}
              >
                <p>{slot.court.split('_').join(' ')}</p>
                <p>
                  {slot.start}:00 - {slot.end}:00
                </p>
              </a>
            ))}
          </div>
            ))
        )}
      </div>
    ))}
  </div>
</div>
  );
}

export default App;