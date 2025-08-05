'use client';

import React from 'react';

const StatusBadge = ({ status }: { status: string }) => {
    const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full inline-block';
    let colorClasses = '';
    let text = status;

    switch (status) {
        case 'pending': colorClasses = 'bg-yellow-500 text-yellow-900'; text = 'В ожидании'; break;
        case 'processing': colorClasses = 'bg-blue-500 text-blue-900'; text = 'В обработке'; break;
        case 'shipped': colorClasses = 'bg-green-500 text-green-900'; text = 'Отправлен'; break;
        case 'delivered': colorClasses = 'bg-teal-500 text-teal-900'; text = 'Доставлен'; break;
        case 'cancelled': colorClasses = 'bg-red-500 text-red-900'; text = 'Отменен'; break;
        default: colorClasses = 'bg-gray-500 text-gray-900'; text = status; break;
    }
    return <span className={`${baseClasses} ${colorClasses}`}>{text}</span>;
};

export default StatusBadge;
