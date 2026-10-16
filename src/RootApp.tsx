import { Suspense, lazy, useEffect, useState } from 'react';
import App from './App';
const BiologyLibrary = lazy(() => import('./alevel/BiologyLibrary'));
export default function RootApp() {
  const [hash,setHash] = useState(window.location.hash);
  useEffect(()=>{const update=()=>setHash(window.location.hash);window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
  const library=hash==='#library'||hash.startsWith('#alevel/');
  useEffect(()=>{if(!library){document.title='Digestive Lab · AlgoCore HUB';window.scrollTo(0,0);}},[library]);
  return library?<Suspense fallback={<div className="ac-app" style={{padding:40}} role="status">Opening the Biology library…</div>}><BiologyLibrary moduleId={hash.startsWith('#alevel/')?hash.slice(8):undefined}/></Suspense>:<App/>;
}
