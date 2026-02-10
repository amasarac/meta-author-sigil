(function(){
  const btn = document.getElementById('orbisButton');
  const canvas = document.getElementById('orbisPortalCanvas');
  if(!btn || !canvas) return;
  btn.addEventListener('click', ()=>{
    canvas.style.display = canvas.style.display === 'none' ? 'block' : 'none';
    const ctx = canvas.getContext('2d');
    const {width,height} = canvas;
    ctx.clearRect(0,0,width,height);
    ctx.beginPath();
    ctx.arc(width/2,height/2,Math.min(width,height)/4,0,Math.PI*2);
    ctx.strokeStyle='#8A2BE2';
    ctx.lineWidth=2;
    ctx.stroke();
  });
  const resize=()=>{ canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
  window.addEventListener('resize', resize); resize();
})();