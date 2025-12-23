import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Building,
    Plus,
    RefreshCw,
    Trash2,
    X
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
    addHours
} from 'date-fns';

const AdminCalendar = () => {
    const { user } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('month');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        time: '09:00',
        location: '',
    });

    useEffect(() => {
        fetchCalendarEvents();
    }, [currentMonth]);

    const fetchCalendarEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/calendar/events');

            const backendEvents = response.data.events.map(event => ({
                ...event,
                date: parseISO(event.date),
                time: event.time ? event.time : undefined
            })).filter(event => {
                // For mentors, show all events (including student applications)
                if (user?.role === 'mentor') return true;
                // For admins, show only faculty events to avoid cluttering with all student apps
                return event.type === 'faculty_event';
            });

            setEvents(backendEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load calendar events');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            if (!newEvent.title || !selectedDate) {
                toast.error('Title and Date are required');
                return;
            }

            await axios.post('/calendar/faculty-events', {
                ...newEvent,
                date: selectedDate.toISOString(),
            });

            toast.success('Event added successfully');
            setIsAddModalOpen(false);
            setNewEvent({ title: '', description: '', time: '09:00', location: '' });
            fetchCalendarEvents();
        } catch (error) {
            console.error('Error adding event:', error);
            toast.error('Failed to add event');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await axios.delete(`/calendar/faculty-events/${eventId}`);
            toast.success('Event deleted successfully');
            fetchCalendarEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => { setCurrentMonth(new Date()); setSelectedDate(new Date()); };

    const getEventsForDate = (date) => events.filter(event => isSameDay(event.date, date));
    const selectedDateEvents = getEventsForDate(selectedDate);

    const renderCalendarDays = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const days = [];
        let day = startDate;

        while (day <= endDate) {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const currentDay = day;

            days.push(
                <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(currentDay)}
                    className={`
            min-h-[100px] p-2 bg-white transition-all relative group cursor-pointer border-r border-b border-slate-100/50
            ${!isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'hover:shadow-md hover:z-10'}
            ${isSelected ? 'ring-2 ring-blue-600 z-10' : ''}
            ${isTodayDate ? 'bg-blue-50/80' : ''}
          `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`
              text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
              ${isTodayDate ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' :
                                isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}
            `}>
                            {format(day, 'd')}
                        </span>
                    </div>

                    <div className="space-y-1 mt-1">
                        {dayEvents.slice(0, 3).map((event, idx) => (
                            <div
                                key={event.id + idx}
                                className={`
                  text-[10px] px-1.5 py-1 rounded-md truncate font-medium border
                  ${event.type === 'faculty_event' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        event.type === 'application_submitted' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            event.type === 'internship_start' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                event.type === 'internship_end' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-gray-50 text-gray-700 border-gray-100'}
                `}
                            >
                                {event.title}
                            </div>
                        ))}
                        {dayEvents.length > 3 && (
                            <div className="text-[10px] text-slate-500 font-medium pl-1">
                                +{dayEvents.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        return days;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <LoadingSpinner size="large" className="text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <CalendarIcon className="h-8 w-8 text-blue-600" />
                            {user?.role === 'mentor' ? 'My Schedule' : 'Faculty Calendar'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Viewing as <span className="font-semibold text-blue-600">{user?.name}</span> ({user?.role})
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchCalendarEvents}
                            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            Add Event
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {format(currentMonth, 'MMMM yyyy')}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={goToToday}
                                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition-all"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={prevMonth}
                                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all text-slate-600"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={nextMonth}
                                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all text-slate-600"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-sm font-bold text-slate-400 py-2 uppercase tracking-wide">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                            {renderCalendarDays()}
                        </div>
                    </div>

                    {/* Selected Date Events */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                {format(selectedDate, 'd')}
                            </div>
                        </div>

                        {selectedDateEvents.length === 0 ? (
                            <div className="text-center py-12 px-4 rounded-xl bg-slate-50 border border-slate-100">
                                <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-900 font-medium">No events scheduled</p>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="mt-4 text-sm text-blue-600 font-medium hover:underline"
                                >
                                    Add an event
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedDateEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className={`
                        p-4 rounded-xl border-l-4 shadow-sm bg-white group relative
                        ${event.type === 'faculty_event' ? 'border-l-purple-500 ring-1 ring-slate-100' :
                                                event.type === 'application_submitted' ? 'border-l-blue-500 ring-1 ring-slate-100' :
                                                    event.type === 'internship_start' ? 'border-l-emerald-500 ring-1 ring-slate-100' :
                                                        'border-l-rose-500 ring-1 ring-slate-100'}
                      `}
                                    >
                                        {event.type === 'faculty_event' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                                                className="absolute top-2 right-2 p-1.5 bg-rose-50 text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}

                                        <div className="flex items-start justify-between mb-2">
                                            <span className={`
                          text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
                          ${event.type === 'faculty_event' ? 'bg-purple-100 text-purple-700' :
                                                    event.type === 'application_submitted' ? 'bg-blue-100 text-blue-700' : ''}
                        `}>
                                                {event.type === 'faculty_event' ? 'FACULTY EVENT' : 'SYSTEM EVENT'}
                                            </span>
                                            {event.time && (
                                                <span className="text-sm font-medium text-slate-500 flex items-center">
                                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                                    {event.time}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="font-bold text-slate-800 mb-1 text-lg leading-tight">{event.title}</h4>
                                        {event.description && <p className="text-sm text-slate-600 mt-1">{event.description}</p>}
                                        {event.location && (
                                            <p className="text-sm text-slate-500 flex items-center font-medium mt-2">
                                                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                                                {event.location}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-900">Add Faculty Event</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddEvent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g., Guest Lecture"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <div className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600">
                                        {format(selectedDate, 'MMM dd, yyyy')}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g., Auditorium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Event details..."
                                ></textarea>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors"
                                >
                                    Add Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminCalendar;
