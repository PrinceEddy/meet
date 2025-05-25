document.addEventListener('DOMContentLoaded', function() {
  const totalSubsEl = document.getElementById('totalSubs');
  const pushSubsEl = document.getElementById('pushSubs');
  const alertForm = document.getElementById('alertForm');
  const chartCanvas = document.getElementById('statsChart');

  let statsChart;

  // Load and display stats
  async function loadStats() {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      totalSubsEl.textContent = data.totalUsers;
      pushSubsEl.textContent = data.pushUsers;
      
      // Update chart
      if (statsChart) {
        statsChart.data.datasets[0].data = [data.totalUsers, data.pushUsers];
        statsChart.update();
      } else {
        statsChart = new Chart(chartCanvas, {
          type: 'bar',
          data: {
            labels: ['Total Subscribers', 'Push Enabled'],
            datasets: [{
              label: 'Subscribers',
              data: [data.totalUsers, data.pushUsers],
              backgroundColor: [
                'rgba(52, 152, 219, 0.7)',
                'rgba(46, 204, 113, 0.7)'
              ],
              borderColor: [
                'rgba(52, 152, 219, 1)',
                'rgba(46, 204, 113, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  // Handle alert form submission
  alertForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const message = document.getElementById('alertMessage').value;
    
    try {
      const response = await fetch('/api/send-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        alert('Alert sent successfully!');
        alertForm.reset();
        loadStats(); // Refresh stats
      } else {
        throw new Error('Failed to send alert');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send alert. Please try again.');
    }
  });

  // Load initial stats
  loadStats();
  
  // Refresh stats every 30 seconds
  setInterval(loadStats, 30000);
});