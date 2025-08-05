const canvas=document.getElementById('orbisPortalCanvas');
const ctx=canvas.getContext('2d');canvas.width=200;canvas.height=200;
let particles=[];for(let i=0;i<50;i++)particles.push({x:100,y:100,angle:Math.random()*2*Math.PI,
speed:Math.random()*1+0.5,radius:Math.random()*80,color:`hsl(${Math.random()*360},100%,70%)`});
function animate(){ctx.clearRect(0,0,200,200);particles.forEach(p=>{p.angle+=0.02;p.x=100+Math.cos(p.angle)*p.radius;
p.y=100+Math.sin(p.angle)*p.radius;ctx.beginPath();ctx.arc(p.x,p.y,2,0,2*Math.PI);ctx.fillStyle=p.color;ctx.fill();});
requestAnimationFrame(animate);}animate();
document.getElementById('orbisButton').addEventListener('click',()=>{window.location.href='orbis/v2.0.0_star_manifold/index.html';});