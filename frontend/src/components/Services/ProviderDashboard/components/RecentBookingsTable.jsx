import React from 'react';
import Badge from '../../../common/Feedback/Badge';
import Button from '../../../common/Buttons/Button';
import { Link } from 'react-router-dom';

const RecentBookingsTable = ({ bookings, onManage, title }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">{title || "Upcoming Bookings"}</h3>
                <Link to="/provider/bookings" className="text-sm font-medium text-gray-500 hover:text-brand-primary">
                    View All
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Client / Pet</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings && bookings.length > 0 ? (
                            bookings.slice(0, 5).map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{booking.client?.first_name} {booking.client?.last_name}</span>
                                            <span className="text-xs text-gray-500">{booking.pet?.name} ({booking.pet?.species})</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                        {booking.service_option?.name || 'General Checkup'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        {booking.booking_time && <span className="block text-xs text-gray-400">{booking.booking_time}</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={booking.status === 'confirmed' ? 'primary' : booking.status === 'pending' ? 'warning' : 'default'} className="rounded-md px-2.5 py-1">
                                            {booking.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {booking.status === 'pending' ? (
                                            <Button size="sm" variant="primary" onClick={() => onManage(booking.id)} className="text-xs py-1.5 h-auto">Accept</Button>
                                        ) : (
                                            <button onClick={() => onManage(booking.id)} className="text-sm font-medium text-gray-500 hover:text-gray-900">View</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">
                                    No upcoming bookings found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentBookingsTable;
