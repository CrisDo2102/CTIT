/** Only known YouTube hosts become frames; every other resource remains a link. */
export function lessonEmbed(raw: string): string | null {
  try {
    const url=new URL(raw); if(url.protocol!=="https:")return null;
    const host=url.hostname.toLowerCase();let id="";
    if(host==="youtu.be")id=url.pathname.split("/")[1]||"";
    else if(["youtube.com","www.youtube.com","m.youtube.com","www.youtube-nocookie.com"].includes(host)){
      id=url.pathname==="/watch"?url.searchParams.get("v")||"":/^\/(embed|shorts|live)\//.test(url.pathname)?url.pathname.split("/")[2]||"":"";
    }
    if(!/^[A-Za-z0-9_-]{11}$/.test(id))return null;
    const time=url.searchParams.get("t")||url.searchParams.get("start")||"";
    let seconds=0;
    if(/^\d+$/.test(time))seconds=Number(time);
    else {const m=time.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);if(m)seconds=Number(m[1]||0)*3600+Number(m[2]||0)*60+Number(m[3]||0);}
    const params=new URLSearchParams({rel:"0"});if(seconds>0&&Number.isSafeInteger(seconds))params.set("start",String(seconds));
    return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
  }catch{return null;}
}
