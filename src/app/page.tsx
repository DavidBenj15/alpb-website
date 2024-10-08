"use client"

import Navbar from './components/navbar/Navbar';
import Link from 'next/link';

export default function Home() {
    return (
        <body>
            <Navbar />
            <div className='w-full flex flex-col justify-center items-center'>
                <p className='m-0'>Hello from Home</p>
                <Link href="/sign-in" className='text-blue-600'>Sign in</Link>
                <Link href="/register-widget" className='text-blue-600'>Register widget</Link>
            </div>
        </body>
    )
}