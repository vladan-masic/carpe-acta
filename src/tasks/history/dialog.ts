import type { KeyboardEvent } from 'react';
/** Native dialog supplies inertness/Escape; explicitly wrap Tab for consistent browsers. */
export function containDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if(event.key!=='Tab')return;
  const controls=[...event.currentTarget.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href],[tabindex]')]
    .filter(element=>!element.matches(':disabled') && element.tabIndex>=0 && !element.hidden);
  const first=controls[0],last=controls[controls.length-1];
  if(!first){event.preventDefault();event.currentTarget.focus();return;}
  if(event.shiftKey && (document.activeElement===first || !event.currentTarget.contains(document.activeElement))) {
    event.preventDefault();last.focus();
  } else if(!event.shiftKey && (document.activeElement===last || !event.currentTarget.contains(document.activeElement))) {
    event.preventDefault();first.focus();
  }
}
