'use client'

import React from 'react'

export default function Popup({ show, onClose, title, children }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-gray-200 z-50">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        
        {children}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
