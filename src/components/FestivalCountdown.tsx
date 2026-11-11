"use client";
import {useEffect,useState} from "react";
type Props={endsAt:string;expiredText?:string};
const digit=(n:number)=>n.toLocaleString("fa-IR",{minimumIntegerDigits:2,useGrouping:false});
export function FestivalCountdown({endsAt,expiredText="زمان این جشنواره به پایان رسیده است"}:Props){
 const [remaining,setRemaining]=useState<number|null>(null);
 useEffect(()=>{
  const deadline=Date.parse(endsAt);
  const tick=()=>setRemaining(Number.isFinite(deadline)?Math.max(0,Math.floor((deadline-Date.now())/1000)):0);
  tick();
  const interval=window.setInterval(tick,1000);
  return()=>window.clearInterval(interval);
 },[endsAt]);
 if(remaining===0)return <p className="ed2-festival-ended" role="status">{expiredText}</p>;
 const d=remaining===null?null:Math.floor(remaining/86400);
 const h=remaining===null?null:Math.floor((remaining%86400)/3600);
 const m=remaining===null?null:Math.floor((remaining%3600)/60);
 const s=remaining===null?null:remaining%60;
 const parts=[{name:"روز",value:d},{name:"ساعت",value:h},{name:"دقیقه",value:m},{name:"ثانیه",value:s}];
 return <div className="ed2-festival-timer" role="timer" aria-label="زمان باقی‌مانده تا پایان جشنواره" aria-live="off">
  <span className="ed2-festival-timer-caption">زمان باقی‌مانده تا پایان جشنواره</span>
  <div className="ed2-festival-clock" dir="ltr">
   {parts.map(part=><span className="ed2-festival-clock-unit" key={part.name}>
    <strong suppressHydrationWarning>{part.value===null?"--":digit(part.value)}</strong>
    <small>{part.name}</small>
   </span>)}
  </div>
 </div>;
}
