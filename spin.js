/*
Small utility to render a spinner. Most of this was provided by ClaudeAI,
but I made some modifications.
*/
const spinnerChars = ['|', '/', '-', '\\'];
let currentIndex = 0;
const speed = 100

process.stdout.write("hello");

function spin() {
  const spinner = spinnerChars[currentIndex];
  process.stdout.write(`\r${spinner}`);
  currentIndex = (currentIndex + 1) % spinnerChars.length;
}

function stop() {
  clearInterval(spinnerInterval);
}
const spinnerInterval = setInterval(spin, speed);

// Stop the spinner after 10 seconds
setTimeout(() => {
  stop();
  console.log('\nSpinner stopped.');
}, 5000);
