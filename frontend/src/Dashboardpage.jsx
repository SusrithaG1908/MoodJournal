import React, { useEffect, useState } from 'react';
import MoodChart from './MoodChart';
import './Dashboard.css';
import { FiTrendingUp, FiCalendar, FiAward, FiBarChart2 } from 'react-icons/fi';
import { FaRegSmile, FaRegLaughBeam, FaRegSadTear,FaRegFrownOpen, FaGrinStars, FaRegMeh } from 'react-icons/fa';
import Navbar from './Navbar';

const Dashboard = () => {
  const [totalEntries, setTotalEntries] = useState(0);
  const [recentMoods, setRecentMoods] = useState([]);
  const [moodStats, setMoodStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setTotalEntries(data.totalEntries);
        setRecentMoods(data.recentMoods);
        setMoodStats(data.moodStats);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setIsLoading(false);
      });
  }, []);

  const mostCommonMood = moodStats && Object.keys(moodStats).length > 0
    ? Object.entries(moodStats).sort((a, b) => b[1] - a[1])[0][0]
    : 'N/A';

const getMoodIcon = (mood) => {
  switch(mood.toLowerCase()) {
    case 'happy': return <FaRegLaughBeam className="mood-icon" />;
    case 'content': return <FaRegSmile className="mood-icon" />;
    case 'sad': return <FaRegSadTear className="mood-icon" />;
    case 'anxious': return <FaRegFrownOpen className="mood-icon" />;
    case 'excited': return <FaGrinStars className="mood-icon" />;
    default: return <FaRegMeh className="mood-icon" />;
  }
};


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
      <Navbar/>
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
              <p className="card2-title">Average Mood</p>
              <p className="card2-value">Content</p>
            </div>
          </div>
          
          <div className="card2 gradient-orange">
            <FiAward className="card2-icon" />
            <div className="card2-content">
              <p className="card2-title">Day Streak</p>
              <p className="card2-value">7</p>
            </div>
          </div>
          
          <div className="card2 gradient-pink">
            <FiCalendar className="card2-icon" />
            <div className="card2-content">
              <p className="card2-title">Most Common</p>
              <p className="card2-value mood-highlight">{mostCommonMood}</p>
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
              <p className="section-subtitle">Your latest emotional states</p>
            </div>
            <div className="mood-list">
              {recentMoods.map((entry, index) => (
                <div key={index} className={`mood-item mood-${entry.mood.toLowerCase()}`}>
                  {getMoodIcon(entry.mood)}
                  <div className="mood-details">
                    <span className="mood-name">{entry.mood}</span>
                    <span className="mood-date">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  <div className="mood-rating">
                    <span>{entry.rating}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;