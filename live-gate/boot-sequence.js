// Bootloader for Live Gate
fetch('threshold-prompts.json')
  .then(response => response.json())
  .then(prompts => {
      let index = 0;
      const box = document.getElementById('promptBox');
      setInterval(() => {
          box.textContent = prompts[index].prompt;
          index = (index + 1) % prompts.length;
      }, 5000);
  });
console.log("Live Gate boot sequence initialized.");
