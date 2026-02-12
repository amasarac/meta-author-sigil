
export function lotusWeaveInvoke(event, ctx){
  console.log("LotusWeave Invocation:", event, ctx);
  if(ctx && ctx.nodeSel){ ctx.nodeSel.classList.add('bloom'); }
}
