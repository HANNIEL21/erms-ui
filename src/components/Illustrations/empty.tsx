import React from 'react'

interface EmptyProps {
    icon: React.ReactNode
    message: string
}

const Empty = ({ icon, message }: EmptyProps) => {
    return (
        <div className="py-8 flex flex-col items-center justify-center gap-2">
            <div className="bg-gray-100 h-20 w-20 flex items-center justify-center rounded-full animate-pulse">
                {icon}
            </div>
            <p className="font-semibold">{message}</p>
        </div>

    )
}

export default Empty
