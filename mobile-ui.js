'use strict';
(()=>{
  const media=matchMedia('(max-width:720px) and (orientation:portrait)');
  const habitat=document.getElementById('habitat');
  const world=document.getElementById('world');
  const tools=document.getElementById('tools');
  const pets=document.getElementById('pets');
  const footer=document.querySelector('footer');
  const tips=document.getElementById('tips');
  const language=document.getElementById('language');
  if(!habitat||!world||!tools||!pets||!footer||!tips||!language)return;
  function apply(){
    if(media.matches){
      /* Keep care controls in normal document flow, immediately below the habitat view. */
      if(tools.parentElement!==habitat||tools.nextElementSibling!==pets)habitat.insertBefore(tools,pets);
      if(tips.parentElement!==world)world.appendChild(tips);
    }else{
      if(tools.parentElement!==habitat||tools.nextElementSibling!==pets)habitat.insertBefore(tools,pets);
      if(tips.parentElement!==footer)footer.insertBefore(tips,language);
    }
  }
  if(media.addEventListener)media.addEventListener('change',apply);else media.addListener(apply);
  apply();
})();
