"use client";
import { useEffect, useRef, useState } from "react";

type Player = { getCurrentTime():number; getDuration():number; getPlayerState():number; destroy():void };
type Youtube = {Player:new(element:HTMLIFrameElement, options:object)=>Player};
type PlayerWindow = Window & { YT?:Youtube; onYouTubeIframeAPIReady?:()=>void };
let loading:Promise<Youtube>|undefined;

function loadPlayer() {
  const win=window as PlayerWindow;
  if(win.YT?.Player)return Promise.resolve(win.YT);
  if(loading)return loading;
  loading=new Promise<Youtube>((resolve,reject)=>{
    const script=document.createElement("script");
    const timer=window.setTimeout(()=>failed(),12000);
    function failed(){clearTimeout(timer);script.remove();loading=undefined;reject(new Error("YouTube unavailable"));}
    win.onYouTubeIframeAPIReady=()=>{if(win.YT?.Player){clearTimeout(timer);resolve(win.YT);}};
    script.src="https://www.youtube.com/iframe_api";script.onerror=failed;document.head.appendChild(script);
  });
  return loading;
}

export function LessonPlayer({embed,title}:{embed:string;title:string}){
  const key=`ctit-video:${embed}`;
  const host=useRef<HTMLDivElement>(null);
  const [saved,setSaved]=useState(0);
  const [start,setStart]=useState<number|null>(null);
  useEffect(()=>{try{const n=Number(localStorage.getItem(key));if(Number.isSafeInteger(n)&&n>0)setSaved(n);}catch{}},[key]);
  useEffect(()=>{
    if(start===null||!host.current)return;
    const frame=document.createElement("iframe");
    const src=new URL(embed);
    if(start>0)src.searchParams.set("start",String(start));
    src.searchParams.set("enablejsapi","1");src.searchParams.set("origin",location.origin);
    frame.src=src.href;frame.title=title;frame.allowFullscreen=true;
    frame.allow="encrypted-media; fullscreen; picture-in-picture";frame.referrerPolicy="strict-origin-when-cross-origin";
    host.current.replaceChildren(frame);
    let active=true,player:Player|undefined,ready=false,ended=false;
    function save(){
      if(!ready||!player||ended)return;
      try{const t=Math.floor(player.getCurrentTime());if(t>0)localStorage.setItem(key,String(t));}catch{}
    }
    loadPlayer().then(api=>{
      if(!active)return;
      player=new api.Player(frame,{events:{
        onReady:()=>{ready=true;},
        onStateChange:({data}:{data:number})=>{
          ended=data===0;
          if(ended){try{localStorage.removeItem(key);}catch{}}
          else if(data===2)save();
        }
      }});
    }).catch(()=>{/* The iframe still plays when tracking is unavailable. */});
    const timer=window.setInterval(save,5000);
    window.addEventListener("pagehide",save);
    return ()=>{active=false;save();clearInterval(timer);window.removeEventListener("pagehide",save);player?.destroy();frame.remove();};
  },[embed,key,start,title]);
  const stamp=`${Math.floor(saved/60)}:${String(saved%60).padStart(2,"0")}`;
  return <div className="classroom-player">{start!==null?<div className="video-frame" ref={host}/>:
    <div><span>VIDEO BÀI HỌC</span><h3>{title}</h3><button className="btn" onClick={()=>setStart(saved)}>{saved?`Tiếp tục từ ${stamp}`:"▶ Xem video tại đây"}</button>
      {saved>0&&<button className="btn secondary" onClick={()=>setStart(0)}>Xem lại từ đầu</button>}
      <small>Video được tải từ YouTube khi bạn bấm xem.</small></div>}</div>;
}
