const dayMs=86400000;
export function localStudyDay(date=new Date()){
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
}
export function studyStreak(days:string[],today:string){
  const seen=new Set(days);
  let day=Date.parse(today), count=0;
  if(!seen.has(today))day-=dayMs;
  while(Number.isFinite(day)&&seen.has(new Date(day).toISOString().slice(0,10))){count++;day-=dayMs;}
  return count;
}
