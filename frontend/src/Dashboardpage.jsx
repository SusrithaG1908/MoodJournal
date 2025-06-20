import React, { useEffect, useState } from 'react';
import MoodChart from './MoodChart';
import './Dashboard.css';
import { FiTrendingUp, FiCalendar, FiAward, FiBarChart2 } from 'react-icons/fi';
import {
  FaRegSmile,
  FaRegLaughBeam,
  FaRegSadTear,
  FaRegFrownOpen,
  FaGrinStars,
  FaRegMeh,
} from 'react-icons/fa';
import Navbar from './Navbar';

const Dashboard = () => {
  const [totalEntries, setTotalEntries] = useState(0);
  const [recentMoodsRaw, setRecentMoodsRaw] = useState([]);
  const [moodStats, setMoodStats] = useState({});
  const [activeDays, setActiveDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('http://localhost:5000/api/dashboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setTotalEntries(data.totalEntries);
          setRecentMoodsRaw(data.recentMoods || []);
          setMoodStats(data.moodStats || {});
          setActiveDays(data.activeDays || 0);
        } else {
          console.error('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const moodIcons = {
    happy: <FaRegLaughBeam className="mood-icon" />,
    content: <FaRegSmile className="mood-icon" />,
    sad: <FaRegSadTear className="mood-icon" />,
    anxious: <FaRegFrownOpen className="mood-icon" />,
    excited: <FaGrinStars className="mood-icon" />,
    neutral: <FaRegMeh className="mood-icon" />,
    joy: <FaRegSmile className="mood-icon" />,
  };

  const getMoodIcon = (mood) =>
    moodIcons[mood?.toLowerCase()] || <FaRegMeh className="mood-icon" />;

  const mostCommonMood =
    moodStats && Object.keys(moodStats).length > 0
      ? Object.entries(moodStats).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

  const uniqueRecentMoods = Object.values(
    recentMoodsRaw.reduce((acc, entry) => {
      const moodKey = entry.mood?.toLowerCase() || 'unknown';
      const entryDate = new Date(entry.date);
      if (!acc[moodKey] || entryDate > new Date(acc[moodKey].date || 0)) {
        acc[moodKey] = {
          ...entry,
          mood: entry.mood || 'N/A',
          rating: entry.rating ?? 0,
        };
      }
      return acc;
    }, {})
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your mood data...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Mood Insights</h1>
          <p className="dashboard-subtitle">Visualizing your emotional journey</p>
        </div>

        <div className="stats-grid">
          <div className="card2 gradient-blue">
            <FiBarChart2 className="card2-icon" />
            <div className="card2-content">
              <p className="card2-title">Total Entries</p>
              <p className="card2-value">{totalEntries}</p>
            </div>
          </div>

          <div className="card2 gradient-green">
            <FiTrendingUp className="card2-icon" />
            <div className="card2-content">
              <p className="card2-title">Top Mood</p>
              <p className="card2-value">
                {mostCommonMood !== 'N/A' ? (
                  <>
                    {getMoodIcon(mostCommonMood)} {mostCommonMood}
                  </>
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          </div>

          <div className="card2 gradient-orange">
            <FiAward className="card2-icon" />
            <div className="card2-content">
              <p className="card2-title">Active Days</p>
              <p className="card2-value">{activeDays}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="chart-container">
            <div className="section-header">
              <h2 className="section-title">Mood Trends</h2>
              <p className="section-subtitle">Your emotional patterns over time</p>
            </div>
            <MoodChart moodStats={moodStats} />
          </div>

          <div className="recent-moods">
            <div className="section-header">
              <h2 className="section-title">Recent Moods</h2>
              <p className="section-subtitle">Latest rating per unique mood</p>
            </div>
            <div className="mood-list">
              {uniqueRecentMoods.length === 0 ? (
                <p>No recent moods available.</p>
              ) : (
                uniqueRecentMoods.map((entry, index) => (
                  <div
                    key={index}
                    className={`mood-item mood-${entry.mood?.toLowerCase() || 'neutral'}`}
                  >
                    {getMoodIcon(entry.mood)}
                    <div className="mood-details">
                      <span className="mood-name">{entry.mood || 'N/A'}</span>
                      <span className="mood-date">
                        {entry.date
                          ? new Date(entry.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'No date'}
                      </span>
                    </div>
                    <div className="mood-rating">
                      <span>{entry.rating !== undefined ? `${entry.rating}/10` : '0/10'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
