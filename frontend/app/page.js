'use client'

import { useState,useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'


export default function Home(){

  const router = useRouter()

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
  }
}, []);

  return(
     <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Welcome to Expert Manager</h1>
      <p>Use the navigation to upload experts or view company details.</p>
    </div>
  );

}