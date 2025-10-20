
const slider = document.getElementById("timelineSlider");
const path = document.getElementById("animatedPath");

slider.addEventListener("input", () => {
  const percent = slider.value / 100;
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length * (1 - percent);
});

// Init
const totalLength = path.getTotalLength();
path.style.strokeDasharray = totalLength;
path.style.strokeDashoffset = totalLength;
