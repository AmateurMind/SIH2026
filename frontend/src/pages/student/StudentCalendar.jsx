import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Building,
  FileText,
  ExternalLink,
  Plus,
  RefreshCw,
  PlayCircle,
  StopCircle,
  CheckCircle2
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

const StudentCalendar = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // month, agenda
  const [filterType, setFilterType] = useState('all');
  const [syncing, setSyncing] = useState(false);

  // Add Personal Event State
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
      }));

      setEvents(backendEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const generateGoogleCalendarLink = (event) => {
    const eventDate = event.date;
    const startDate = format(eventDate, "yyyyMMdd'T'HHmmss");
    const endDateTime = addHours(eventDate, 1);
    const endDate = format(endDateTime, "yyyyMMdd'T'HHmmss");

    let description = `📌 ${event.title}\n\n`;
    description += `🏢 Company: ${event.company}\n`;
    description += `\n📅 Added from CampusBuddy Calendar`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: description,
      location: event.location || 'Online',
      sf: 'true',
      output: 'xml'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Export all events to Google Calendar (batch)
  const exportAllToGoogleCalendar = () => {
    if (events.length === 0) {
      toast.error('No events to export');
      return;
    }
    const firstEvent = events[0];
    syncToGoogleCalendar(firstEvent);
    if (events.length > 1) {
      toast.success(`Opening first event. You have ${events.length - 1} more events to add.`, {
        duration: 5000
      });
    }
  };

  // Generate ICS file content for all events
  const generateICSContent = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusBuddy//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:CampusBuddy Events',
      'X-WR-TIMEZONE:Asia/Kolkata'
    ];

    events.forEach(event => {
      const startDate = format(event.date, "yyyyMMdd'T'HHmmss");
      const endDateTime = addHours(event.date, 1);
      const endDate = format(endDateTime, "yyyyMMdd'T'HHmmss");
      const uid = `${event.id}@campusbuddy.com`;

      let description = `${event.title}\\n`;
      description += `Company: ${event.company}\\n`;

      const eventICS = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${event.location || ''}`,
        `CATEGORIES:${event.type.toUpperCase()}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      ];

      icsContent = icsContent.concat(eventICS);
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  };

  // Download ICS file
  const downloadICSFile = () => {
    if (events.length === 0) {
      toast.error('No events to download');
      return;
    }

    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `campusbuddy-events-${format(new Date(), 'yyyy-MM-dd')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${events.length} events as .ics file`);
  };

  const syncToGoogleCalendar = async (event) => {
    setSyncing(true);
    window.open(generateGoogleCalendarLink(event), '_blank');
    setSyncing(false);
  };

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter(e => {
      if (filterType === 'applied') return e.type === 'application_submitted';
      if (filterType === 'starts') return e.type === 'internship_start';
      if (filterType === 'ends') return e.type === 'internship_end';
      return true;
    });
  }, [events, filterType]);

  const getEventsForDate = (date) => filteredEvents.filter(event => isSameDay(event.date, date));
  const selectedDateEvents = getEventsForDate(selectedDate);
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => { setCurrentMonth(new Date()); setSelectedDate(new Date()); };

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
            min-h-[60px] sm:min-h-[80px] lg:min-h-[120px] p-1 sm:p-2 bg-white transition-all relative group cursor-pointer border-r border-b border-slate-100/50 touch-manipulation
            ${!isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'hover:shadow-md hover:z-10 active:bg-slate-50'}
            ${isSelected ? 'ring-2 ring-blue-600 z-10' : ''}
            ${isTodayDate ? 'bg-blue-50/80' : ''}
          `}
        >
          <div className="flex justify-between items-start">
            <span className={`
              text-xs sm:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex items-center justify-center rounded-full
              ${isTodayDate ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' :
                isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}
            `}>
              {format(day, 'd')}
            </span>

            <button 
              onClick={(e) => { e.stopPropagation(); setIsAddModalOpen(true); }}
              className="opacity-0 group-hover:opacity-100 sm:opacity-0 group-hover:sm:opacity-100 transition-opacity p-0.5 sm:p-1 hover:bg-slate-100 active:bg-slate-200 rounded text-slate-400 hover:text-blue-600 touch-manipulation" 
              title="Add Event"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          <div className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1">
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div
                key={event.id + idx}
                className={`
                  text-[8px] sm:text-[9px] lg:text-[10px] px-1 sm:px-1.5 py-0.5 sm:py-1 rounded truncate font-medium border
                  ${event.type === 'application_submitted' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                  ${event.type === 'internship_start' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                  ${event.type === 'internship_end' ? 'bg-rose-50 text-rose-700 border-rose-100' : ''}
                  ${event.type === 'faculty_event' ? 'bg-purple-50 text-purple-700 border-purple-100' : ''}
                `}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500 font-medium pl-0.5 sm:pl-1">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    return days;
  };

  const renderAgendaView = () => {
    const eventsList = filteredEvents
      .sort((a, b) => a.date - b.date);

    if (eventsList.length === 0) {
      return (
        <div className="text-center py-12">
          <CalendarIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No events found</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 sm:space-y-4">
        {eventsList.map(event => (
          <div
            key={event.id}
            className={`
              bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all
              ${event.type === 'application_submitted' ? 'border-l-blue-500' : ''}
              ${event.type === 'internship_start' ? 'border-l-emerald-500' : ''}
              ${event.type === 'internship_end' ? 'border-l-rose-500' : ''}
              ${event.type === 'faculty_event' ? 'border-l-purple-500' : ''}
            `}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`
                    px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold
                    ${event.type === 'application_submitted' ? 'bg-blue-100 text-blue-700' : ''}
                    ${event.type === 'internship_start' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${event.type === 'internship_end' ? 'bg-rose-100 text-rose-700' : ''}
                    ${event.type === 'faculty_event' ? 'bg-purple-100 text-purple-700' : ''}
                  `}>
                    {event.type === 'application_submitted' && '📝 Applied'}
                    {event.type === 'internship_start' && '🚀 Start Date'}
                    {event.type === 'internship_end' && '🏁 End Date'}
                    {event.type === 'faculty_event' && '🎓 Faculty Event'}
                  </span>
                </div>

                <h3 className="text-slate-900 font-bold text-base sm:text-lg mb-1">{event.title}</h3>
                {event.description && <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-2">{event.description}</p>}

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-600">
                  <span className="flex items-center">
                    <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-slate-400" />
                    {event.company}
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-slate-400" />
                    {format(event.date, 'MMM dd, yyyy')}
                  </span>
                  {event.time && (
                    <span className="flex items-center">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-slate-400" />
                      {event.time}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 sm:ml-4">
                <button
                  onClick={() => syncToGoogleCalendar(event)}
                  disabled={syncing}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation flex-1 sm:flex-none"
                >
                  <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Google</span>
                  <span className="sm:hidden">Sync</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="large" className="text-indigo-600" />
      </div>
    );
  }

  // Calculate stats
  const submittedCount = events.filter(e => e.type === 'application_submitted').length;
  const startsCount = events.filter(e => e.type === 'internship_start').length;
  const endsCount = events.filter(e => e.type === 'internship_end').length;

  // Add Personal Event Handlers

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      if (!newEvent.title || !selectedDate) {
        toast.error('Title and Date are required');
        return;
      }

      await axios.post('/calendar/student-events', {
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
      await axios.delete(`/calendar/student-events/${eventId}`);
      toast.success('Event deleted successfully');
      fetchCalendarEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-[68px] pb-20 md:pb-12 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
              <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              My Calendar
            </h1>
            <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base font-medium">
              Track your internship applications and timelines
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* View Mode Switcher */}
            <div className="flex bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-0.5 sm:p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all touch-manipulation ${viewMode === 'month' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                  }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all touch-manipulation ${viewMode === 'agenda' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                  }`}
              >
                Agenda
              </button>
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer outline-none touch-manipulation"
            >
              <option value="all">All Events</option>
              <option value="applied">Applied</option>
              <option value="starts">Starts</option>
              <option value="ends">Ends</option>
              <option value="personal">Personal</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchCalendarEvents}
              className="p-2 sm:p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-all shadow-sm touch-manipulation"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Export buttons */}
            <div className="flex gap-2">
              <button
                onClick={exportAllToGoogleCalendar}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] touch-manipulation"
              >
                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sync Google</span>
                <span className="sm:hidden">Sync</span>
              </button>

              <button
                onClick={downloadICSFile}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.98] touch-manipulation"
              >
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">.ics</span>
                <span className="sm:hidden">ICS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* ... keeping stats cards ... */}
          {/* To save tokens, I'm abbreviating unchanged parts in my thought process, but for tool use I must be precise with ReplacementContent or replacing smaller chunks. 
              Since I'm replacing a huge chunk from line 357 to 640 (return statement included), I should be careful.
              Actually, it's safer to use multi_replace to insert state at top and modal at bottom.
           */}
          {/* Let's try to stick to replacing specific blocks 
              1. Insert state/handlers before return.
              2. Update return block to include Modal.
           */}
          <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-soft border border-slate-100 transition-all hover:shadow-soft-hover hover:-translate-y-1">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Applications Submitted</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {submittedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-soft border border-slate-100 transition-all hover:shadow-soft-hover hover:-translate-y-1">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-emerald-50 rounded-lg sm:rounded-xl">
                <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Internship Starts</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {startsCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-soft border border-slate-100 transition-all hover:shadow-soft-hover hover:-translate-y-1">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-rose-50 rounded-lg sm:rounded-xl">
                <StopCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Internship Ends</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">
                  {endsCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'month' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Calendar Grid */}
            <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-soft border border-slate-100 p-3 sm:p-4 lg:p-6 overflow-x-auto">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={goToToday}
                    className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all touch-manipulation"
                  >
                    Today
                  </button>
                  <button
                    onClick={prevMonth}
                    className="p-1.5 sm:p-2 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-md sm:rounded-lg transition-all text-slate-600 touch-manipulation"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 sm:p-2 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-md sm:rounded-lg transition-all text-slate-600 touch-manipulation"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 mb-2 sm:mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs sm:text-sm font-bold text-slate-400 py-1 sm:py-2 uppercase tracking-wide">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {renderCalendarDays()}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100 text-[10px] sm:text-xs lg:text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-slate-600">Applied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="font-medium text-slate-600">Starts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="font-medium text-slate-600">Ends</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="font-medium text-slate-600">Faculty</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="font-medium text-slate-600">Personal</span>
                </div>
              </div>
            </div>

            {/* Selected Date Events */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft border border-slate-100 p-4 sm:p-5 lg:p-6 h-fit lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg">
                  {format(selectedDate, 'd')}
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full mb-4 sm:mb-6 py-2.5 sm:py-3 border-2 border-dashed border-blue-200 bg-blue-50/50 text-blue-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-400 active:bg-blue-100 transition-all touch-manipulation"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Add Personal Event</span>
                <span className="sm:hidden">Add Event</span>
              </button>

              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 sm:py-12 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100">
                  <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-slate-900 font-medium text-sm sm:text-base">No events scheduled</p>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">Free day!</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event.id}
                      className={`
                        p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 shadow-sm bg-white relative group
                        ${event.type === 'application_submitted' ? 'border-l-blue-500 ring-1 ring-slate-100' : ''}
                        ${event.type === 'internship_start' ? 'border-l-emerald-500 ring-1 ring-slate-100' : ''}
                        ${event.type === 'internship_end' ? 'border-l-rose-500 ring-1 ring-slate-100' : ''}
                        ${event.type === 'faculty_event' ? 'border-l-purple-500 ring-1 ring-slate-100' : ''}
                        ${event.type === 'student_personal_event' ? 'border-l-amber-500 ring-1 ring-slate-100' : ''}
                      `}
                    >
                      {event.type === 'student_personal_event' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-rose-50 text-rose-600 rounded-md sm:rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-rose-100 active:bg-rose-200 touch-manipulation"
                          title="Delete Event"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      )}

                      <div className="flex items-start justify-between mb-2">
                        <span className={`
                          text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
                          ${event.type === 'application_submitted' ? 'bg-blue-100 text-blue-700' : ''}
                          ${event.type === 'internship_start' ? 'bg-emerald-100 text-emerald-700' : ''}
                          ${event.type === 'internship_end' ? 'bg-rose-100 text-rose-700' : ''}
                          ${event.type === 'faculty_event' ? 'bg-purple-100 text-purple-700' : ''}
                          ${event.type === 'student_personal_event' ? 'bg-amber-100 text-amber-700' : ''}
                        `}>
                          {event.type === 'application_submitted' && 'APPLIED'}
                          {event.type === 'internship_start' && 'START'}
                          {event.type === 'internship_end' && 'END'}
                          {event.type === 'faculty_event' && 'FACULTY'}
                          {event.type === 'student_personal_event' && 'PERSONAL'}
                        </span>
                        {event.time && (
                          <span className="text-xs sm:text-sm font-medium text-slate-500 flex items-center">
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />
                            {event.time}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-800 mb-1 text-base sm:text-lg leading-tight">{event.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 flex items-center font-medium">
                        <Building className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-slate-400" />
                        {event.company}
                      </p>

                      <button
                        onClick={() => syncToGoogleCalendar(event)}
                        className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation"
                      >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Add to Google Calendar</span>
                        <span className="sm:hidden">Add to Google</span>
                      </button>
                      {event.description && <p className="text-xs sm:text-sm text-slate-600 mt-2 pb-2 pl-1 border-t border-slate-100 pt-2">{event.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Agenda View */
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft border border-slate-100 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 flex-wrap">
              All Events
              <span className="text-xs sm:text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {filteredEvents.length} Events
              </span>
            </h2>
            {renderAgendaView()}
          </div>
        )}

        {/* Add Event Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0">
                <h3 className="font-bold text-base sm:text-lg text-slate-900">Add Personal Event</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 active:bg-slate-300 text-slate-500 transition-colors touch-manipulation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                    placeholder="e.g., Exam Prep"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Date</label>
                    <div className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg sm:rounded-xl bg-slate-50 text-slate-600 text-xs sm:text-sm">
                      {format(selectedDate, 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                    placeholder="e.g., Library"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm sm:text-base"
                    placeholder="Event details..."
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg sm:rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors touch-manipulation text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white font-bold rounded-lg sm:rounded-xl hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-500/20 transition-colors touch-manipulation text-sm sm:text-base"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentCalendar;
