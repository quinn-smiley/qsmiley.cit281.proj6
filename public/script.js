document.addEventListener('DOMContentLoaded', async () => {
  // Prompt for name first
  let name = prompt('Enter your name:');
  if (name) {
    await fetch('/name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name })
    });
  }

  document.getElementById('quiz-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const color = parseInt(document.querySelector('input[name="color"]:checked').value);
    const music = parseInt(document.querySelector('input[name="music"]:checked').value);
    const activity = parseInt(document.querySelector('input[name="activity"]:checked').value);

    const response = await fetch('/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        colorResponse: color,
        musicResponse: music,
        activityResponse: activity
      })
    });

    const data = await response.json();
    console.log(data);

    const resultRes = await fetch('/get-result', {
      credentials: 'include'
    });

    const resultText = await resultRes.text();
    document.getElementById('result').textContent = resultText;
  });
});

// Rename user
document.getElementById('rename-button').addEventListener('click', async () => {
  const newName = document.getElementById('rename-input').value.trim();

  if (!newName) {
    alert('Please enter a name.');
    return;
  }

  const response = await fetch('/rename', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newName })
  });

  const data = await response.json();
  if (response.ok) {
    alert(`Name changed to ${data.name}`);
  } else {
    alert(data.error || 'Failed to rename');
  }
});

// Reset session
document.getElementById('reset-button').addEventListener('click', async () => {
  const response = await fetch('/reset', {
    method: 'DELETE',
    credentials: 'include'
  });

  if (response.ok) {
    alert('Quiz reset!');
    window.location.reload();
  } else {
    const data = await response.json();
    alert(data.error || 'Failed to reset');
  }
});

