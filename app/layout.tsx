import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'সিলেটে জামাত | Sylhet Jamaat',description:'সিলেটের মসজিদের জামাতের সময় ও স্থানীয় মানুষের দেওয়া তথ্য।',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/icon-192.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="bn"><body>{children}</body></html>}
