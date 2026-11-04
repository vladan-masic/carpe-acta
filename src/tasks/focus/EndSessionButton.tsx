import type { Locale } from '../../i18n/locales';
import type { FocusController } from './controller';
import { useFocusSession } from './FocusProvider';
import { focusCopy } from './copy';
export function EndSessionButton({locale,sessionId,controller}:{locale:Locale;sessionId:string;controller:FocusController|null}) {
 const focus=useFocusSession();
 return <button onClick={async()=>{await controller?.command('finish',sessionId);if(controller?.getSnapshot().session?.id===sessionId)focus.requestReview();}}>{focusCopy[locale].end}</button>;
}
