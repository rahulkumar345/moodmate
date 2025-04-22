import { useState, useEffect } from "react";
import Calendar from "react-calendar";

import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiThunderstorm,
  WiSnow,
} from "react-icons/wi";
import { format } from "date-fns";
import { TbBackground } from "react-icons/tb";
import { IoIosSunny } from "react-icons/io";
import { IoCloudySharp } from "react-icons/io5";

const YOUR_API_KEY = "e85059c19d571b90dad7af87d150cf5b";

const moodOptions = [
  { icon: "😊", label: "Happy", color: "bg-yellow-300" },
  { icon: "😐", label: "Neutral", color: "bg-gray-300" },
  { icon: "😢", label: "Sad", color: "bg-blue-300" },
  { icon: "😠", label: "Angry", color: "bg-red-300" },
  { icon: "😴", label: "Tired", color: "bg-purple-300" },
];

export default function MoodMate() {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [weather, setWeather] = useState(null);
  const [entries, setEntries] = useState(
    () => JSON.parse(localStorage.getItem("moodEntries")) || []
  );
  const [filterMood, setFilterMood] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentDate = format(new Date(), "MMMM dd, yyyy");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${YOUR_API_KEY}&units=metric`
      );
      const data = await res.json();
      setWeather({ temp: data.main.temp, condition: data.weather[0].main });
    });
  }, []);

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "Clear":
        return <IoIosSunny size={28} className="text-yellow-100" />;
      case "Clouds":
        return <WiCloudy size={28} />;
      case "Rain":
        return <WiRain size={28} />;
      case "Thunderstorm":
        return <WiThunderstorm size={28} />;
      case "Snow":
        return <WiSnow size={28} />;
      default:
        return <WiDaySunny size={28} />;
    }
  };

  const handleSave = () => {
    if (!mood) {
      return alert("Please select your mood");
    }
    if (!note) {
      return alert("Please select your note");
    }
    const newEntry = {
      date: currentDate,
      mood,
      note,
      weather,
    };
    const updated = [newEntry, ...entries];
    localStorage.setItem("moodEntries", JSON.stringify(updated));
    setEntries(updated);
    setMood(null);
    setNote("");
    alert("Your mood entry has been saved!");
  };

  const filteredEntries =
    filterMood === "All"
      ? entries
      : entries.filter((e) => e.mood.label === filterMood);

  const markedDates = entries.map((e) => new Date(e.date));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-6 bg-orange-200 p-4 text-center">
      <div className="w-full bg-gradient-to-b from-orange-400 to-orange-100 rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">MoodMate</h1>
          {weather && (
            <div className="flex items-center gap-1 text-white">
              {getWeatherIcon(weather.condition)}
              <span>{Math.round(weather.temp)}°C</span>
            </div>
          )}
        </div>

        <div className="w-full bg-orange-100 rounded-2xl shadow-md p-6 mb-4">
          <div className="mb-4 flex flex-col items-center justify-center w-full gap-2">
            <h2 className="font-semibold">{currentDate}</h2>
            <p className="mb-2">How are you feeling today?</p>
            <div className="flex justify-between mb-2 w-full">
              {moodOptions.map((m, idx) => (
                <button
                  key={idx}
                  className={`text-2xl p-2 rounded-full transition ${
                    mood?.label === m.label
                      ? `${m.color} scale-110`
                      : "hover:scale-105"
                  }`}
                  onClick={() => setMood(m)}
                >
                  {m.icon}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full p-2 rounded border resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded w-full"
          >
            Save
          </button>
        </div>

        <div className="bg-orange-100  rounded-2xl  shadow-md p-2">
          <div className="flex justify-center items-center">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              formatShortWeekday={(locale, date) =>
                date.toLocaleDateString(locale, { weekday: "narrow" })
              }
              tileClassName={({ date }) => {
                const entry = entries.find(
                  (e) => new Date(e.date).toDateString() === date.toDateString()
                );
                return entry
                  ? `calendar-tile has-entry mood-circle ${entry.mood.color}`
                  : "calendar-tile";
              }}
              tileContent={({ date }) => {
                const entry = entries.find(
                  (e) => new Date(e.date).toDateString() === date.toDateString()
                );
                if (!entry) return null;
                const icon = getWeatherIcon(entry.weather.condition);
                return (
                  <div className="flex items-center justify-center text-[10px] mt-1 space-y-[1px]">
                    <span className="text-lg">{entry.mood.icon}</span>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full  bg-gradient-to-b from-orange-400 to-orange-100 rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-white">All Notes</h2>

        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {["All", ...moodOptions.map((m) => m.label)].map((label) => (
            <button
              key={label}
              onClick={() => setFilterMood(label)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterMood === label
                  ? "bg-orange-800 text-white"
                  : "bg-orange-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredEntries.map((entry, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg shadow-sm text-left flex gap-2 ${entry.mood.color}`}
            >
              <span className="text-4xl">{entry.mood.icon}</span>

              <div className="flex flex-col gap-y-1 w-full">
                <span className="text-sm">{entry.note}</span>
                <div className="flex justify-between w-full items-center">
                  <span className="text-sm text-gray-600">{entry.date}</span>
                  {entry.weather && (
                    <div className="text-xs mt-1 text-gray-700">
                      {Math.round(entry.weather.temp)}°C -{" "}
                      {entry.weather.condition}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
