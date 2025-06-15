import React, { useEffect, useState } from 'react';
import reportingService, { BasicStatsResponse, ApiError } from '../services/reportingService';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BackOfficePage: React.FC = () => {
  const [stats, setStats] = useState<BasicStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await reportingService.getBasicStats();
        setStats(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to fetch statistics.');
        console.error('Fetch stats error:', apiError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <p>Loading statistics...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  if (!stats) {
    return <p>No statistics data available.</p>;
  }

  const usersChartData = {
    labels: ['Total Users'],
    datasets: [
      {
        label: 'Users',
        data: [stats.totalUsers],
        backgroundColor: ['rgba(54, 162, 235, 0.6)'], // Blue
        borderColor: ['rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const activitiesChartData = {
    labels: ['Total Activities'],
    datasets: [
      {
        label: 'Activities',
        data: [stats.totalActivities],
        backgroundColor: ['rgba(255, 99, 132, 0.6)'], // Red
        borderColor: ['rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };
  
  const combinedChartData = {
    labels: ['Total Users', 'Total Activities'],
    datasets: [
        {
            label: 'Count',
            data: [stats.totalUsers, stats.totalActivities],
            backgroundColor: [
                'rgba(54, 162, 235, 0.6)', // Blue for Users
                'rgba(255, 99, 132, 0.6)', // Red for Activities
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
        },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Basic Application Statistics',
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1, // Ensure y-axis shows whole numbers for counts
            }
        }
    }
  };


  return (
    <div>
      <h2>Back Office - Application Statistics</h2>
      <p>This page displays basic statistics about the application. Currently, it's accessible to any logged-in user. In a production environment, this should be restricted to administrators.</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <div style={{ width: '100%', maxWidth: '500px', marginBottom: '20px' }}>
          <h3>Summary Chart</h3>
          <Bar data={combinedChartData} options={chartOptions} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', marginTop: '30px' }}>
        <div style={{ width: '100%', maxWidth: '350px', marginBottom: '20px' }}>
          <h4>Users Overview</h4>
          {stats.totalUsers > 0 ? (
            <Doughnut 
              data={{
                labels: ['Total Users'],
                datasets: usersChartData.datasets,
              }} 
              options={{ responsive: true, plugins: { legend: { display: false }, title: {display: true, text: `Total Users: ${stats.totalUsers}`}}}} 
            />
          ) : <p>No user data to display.</p>}
        </div>
        <div style={{ width: '100%', maxWidth: '350px', marginBottom: '20px' }}>
          <h4>Activities Overview</h4>
           {stats.totalActivities > 0 ? (
            <Doughnut 
              data={{
                labels: ['Total Activities'],
                datasets: activitiesChartData.datasets,
              }} 
              options={{ responsive: true, plugins: { legend: { display: false }, title: {display: true, text: `Total Activities: ${stats.totalActivities}`}}}} 
            />
          ) : <p>No activity data to display.</p>}
        </div>
      </div>

    </div>
  );
};

export default BackOfficePage;
