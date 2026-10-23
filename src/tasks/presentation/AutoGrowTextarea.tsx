import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';

export function AutoGrowTextarea(props:TextareaHTMLAttributes<HTMLTextAreaElement>) {
 const ref=useRef<HTMLTextAreaElement>(null);
 useLayoutEffect(()=>{
  const element=ref.current;if(!element)return;
  const resize=()=>{
   element.style.height='0px';
   const css=getComputedStyle(element);
   element.style.height=`${element.scrollHeight+parseFloat(css.borderTopWidth||'0')+parseFloat(css.borderBottomWidth||'0')}px`;
  };
  resize();let width=element.clientWidth;
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(()=>{if(element.clientWidth!==width){width=element.clientWidth;resize();}});
  observer?.observe(element);window.addEventListener('resize',resize);
  return()=>{observer?.disconnect();window.removeEventListener('resize',resize);};
 },[props.value]);
 return <textarea {...props} rows={1} ref={ref}/>;
}
