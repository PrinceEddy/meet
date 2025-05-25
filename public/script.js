document.addEventListener('DOMContentLoaded', function() {
  // Initialize OneSignal
  window.OneSignal = window.OneSignal || [];
  OneSignal.push(function() {
    OneSignal.init({
      appId: "YOUR_ONESIGNAL_APP_ID", // Replace this!
      promptOptions: {
        slidedown: {
          enabled: true,
          autoPrompt: false
        }
      }
    });
  });

  // Handle form submission
  const form = document.getElementById('subscribeForm');
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const allowPush = document.getElementById('allowPush').checked;

    // Register for push notifications if allowed
    if (allowPush) {
      try {
        await OneSignal.Notifications.requestPermission();
        if (Notification.permission === "granted") {
          await OneSignal.User.pushSubscription.optIn();
        }
      } catch (err) {
        console.error("Push registration failed:", err);
      }
    }

    // Save to backend
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          phone,
          allowPush
        })
      });

      if (response.ok) {
        alert('Successfully subscribed!');
        form.reset();
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Subscription failed. Please try again.');
    }
  });
});