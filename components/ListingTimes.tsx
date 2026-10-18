'use client';
import {useSiteText} from './SiteText';
import {Camera,FileText} from 'lucide-react';
import {prayers,currentReport,type Prayer,type Report} from '@/lib/prayers';
import {prayerNames,states,timeLabel,dateLabel,sources} from '@/lib/ui';
export default function ListingTimes({mosqueId,reports,today,prayer,bn}:{mosqueId:string;reports:Report[];today:string;prayer:Prayer;bn:boolean}){
 const t=useSiteText(bn);
 const rows=prayers.map(p=>({p,...currentReport(reports,mosqueId,p,today)}));
 const evidence=Array.from(new Map(rows.filter(x=>x.report).map(x=>[x.report!.id,x.report!])).values());
 return <div className="listing-times"><h3>{t('জামাতের সময়','Jamaat times')}</h3><div className="inline-times">{rows.map(({p,report,state})=><div className={p===prayer?'focused-prayer':''} key={p}><span>{prayerNames[p][bn?0:1]}</span><strong>{report&&state!=='conflict'?report.times[p]?.map(at=>timeLabel(at,bn)).join(' / '):(t('জানা নেই','Unknown'))}</strong>{report&&<small className={'status '+state}>{states[state][bn?0:1]}</small>}</div>)}</div>{evidence.length?evidence.map(r=><div className="inline-evidence" key={r.id}><p><strong>{t('জানিয়েছেন: ','Reported by: ')}{r.authorName||(t('নাম দেওয়া হয়নি','Name not provided'))}</strong><br/>{t('জমা: ','Submitted: ')}{dateLabel(r.created,bn)} · {t('দেখেছেন: ','Checked: ')}{dateLabel(r.observed,bn)}<br/>{t('প্রযোজ্য শেষ দিন: ','Applies through: ')}{dateLabel(r.validUntil,bn)}<br/>{prayers.filter(p=>r.times[p]).map(p=>prayerNames[p][bn?0:1]).join(' · ')} · {sources[r.source]?.[bn?0:1]}</p>{r.photo?<a href={'/api/photo/'+r.id} target="_blank" rel="noreferrer"><Camera size={14}/>{t('সময়সূচির ছবি','Timetable photo')}</a>:<span className="evidence-label"><FileText size={14}/>{t('রিপোর্টদাতার বিবরণ','Reporter’s explanation')}</span>}{r.proofNote&&<p>{r.proofNote}</p>}{!r.photo&&!r.proofNote&&<p>{t('ছবি বা বিবরণ দেওয়া হয়নি।','No photo or explanation provided.')}</p>}</div>):<p className="no-report">{t('এই মসজিদের সময় এখনও কেউ জানাননি।','No times have been reported for this mosque yet.')}</p>}</div>;
}
