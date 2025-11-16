import { Card } from './ui/card';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function Events() {
  const [steamStates, setSteamStates] = useState<{[key: number]: boolean}>({});
  const [acceptedStates, setAcceptedStates] = useState<{[key: number]: boolean}>({});
  const [participantCounts, setParticipantCounts] = useState<{[key: number]: number}>({});
  const cardRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  // Steam fade-in effect on card enter view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = parseInt(entry.target.getAttribute('data-card-id') || '0');
            setSteamStates(prev => ({ ...prev, [cardId]: true }));
            setTimeout(() => {
              setSteamStates(prev => ({ ...prev, [cardId]: false }));
            }, 800);
          }
        });
      },
      { threshold: 0.2 }
    );

    Object.values(cardRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleAccept = (eventId: number, currentAttendees: number) => {
    setAcceptedStates(prev => ({ ...prev, [eventId]: true }));
    setParticipantCounts(prev => ({ 
      ...prev, 
      [eventId]: prev[eventId] !== undefined ? prev[eventId] + 1 : currentAttendees + 1 
    }));
  };

  const handleCancelParticipation = (eventId: number, currentAttendees: number) => {
    setAcceptedStates(prev => ({ ...prev, [eventId]: false }));
    setParticipantCounts(prev => ({ 
      ...prev, 
      [eventId]: prev[eventId] !== undefined ? prev[eventId] - 1 : currentAttendees - 1 
    }));
  };

  const events = [
    {
      id: 1,
      title: 'Friday Night Sauna',
      host: 'Mika Virtanen',
      date: 'Friday, Nov 17',
      time: '19:00 - 22:00',
      location: 'Löyly Helsinki',
      attendees: 8,
      maxAttendees: 12,
      description: 'Join us for a relaxing Friday evening sauna session! We\'ll have some refreshments and good company.',
      status: 'invited'
    },
    {
      id: 2,
      title: 'Mökkisauna & Grill',
      host: 'Anna Korhonen',
      date: 'Saturday, Nov 18',
      time: '15:00 - 20:00',
      location: 'Anna\'s summer cottage (Espoo)',
      attendees: 4,
      maxAttendees: 6,
      description: 'Cozy afternoon at my family cottage! Wood-heated sauna followed by grilling. Bring your own drinks 🌲',
      status: 'going'
    },
    {
      id: 3,
      title: 'Sunday Sauna',
      host: 'Janne Saunisto',
      date: 'Sunday, Nov 19',
      time: '18:00 - 20:00',
      location: 'Home sauna (Kallio)',
      attendees: 3,
      maxAttendees: 4,
      description: 'Small group session at my place. Electric sauna, good löyly guaranteed!',
      status: 'maybe'
    },
    {
      id: 4,
      title: 'Sauna & Chill',
      host: 'Emma Lahti',
      date: 'Wednesday, Nov 22',
      time: '17:00 - 19:00',
      location: 'Allas Sea Pool',
      attendees: 12,
      maxAttendees: 15,
      description: 'Midweek sauna session to relax and unwind. Open to all levels!',
      status: 'invited'
    },
    {
      id: 5,
      title: 'Lakeside Sauna Evening',
      host: 'Petri Mäkinen',
      date: 'Saturday, Nov 25',
      time: '16:00 - 21:00',
      location: 'Family mökkisauna (Järvenpää)',
      attendees: 5,
      maxAttendees: 8,
      description: 'Traditional lakeside sauna with avanto swimming. Bring warm clothes and towels! 🏊‍♂️',
      status: 'invited'
    },
    {
      id: 6,
      title: 'Quick Evening Session',
      host: 'Sari Lehto',
      date: 'Thursday, Nov 23',
      time: '19:30 - 21:00',
      location: 'Apartment building sauna (Töölö)',
      attendees: 2,
      maxAttendees: 3,
      description: 'Just a casual sauna in our building. Low-key and relaxed ☺️',
      status: 'invited'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going':
        return { bg: 'bg-[#10b981]/10', border: 'border-[#10b981]', text: 'text-[#10b981]' };
      case 'maybe':
        return { bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]', text: 'text-[#f59e0b]' };
      default:
        return { bg: 'bg-[#D01400]/10', border: 'border-[#D01400]', text: 'text-[#D01400]' };
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="font-bold text-white mb-1" style={{ fontSize: '24px' }}>Sauna Events</h2>
        <p className="text-gray-400 font-normal" style={{ fontSize: '13px' }}>
          Join sauna get-togethers with friends and community
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-2">
        {events.map((event) => {
          const statusColors = getStatusColor(event.status);
          const currentAttendees = participantCounts[event.id] !== undefined ? participantCounts[event.id] : event.attendees;
          return (
            <div 
              key={event.id}
              ref={el => cardRefs.current[event.id] = el}
              data-card-id={event.id}
              className={`steam-fade ${steamStates[event.id] ? 'active' : ''}`}
            >
              <Card className="bg-[#1F1F23] border-[#2C2B36] rounded-2xl overflow-hidden heat-wave">
                <div className="p-5">
                  {/* Invitation Text */}
                  <p className="text-gray-400 font-normal mb-3" style={{ fontSize: '12px' }}>
                    {event.host} invited you to:
                  </p>

                  {/* Event Title */}
                  <h3 className="font-bold text-white mb-3" style={{ fontSize: '20px' }}>
                    {event.title}
                  </h3>

                  {/* Event Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span className="font-normal" style={{ fontSize: '13px' }}>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span className="font-normal" style={{ fontSize: '13px' }}>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span className="font-normal" style={{ fontSize: '13px' }}>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4" />
                      <span className="font-normal" style={{ fontSize: '13px' }}>
                        {currentAttendees} / {event.maxAttendees} attending
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 font-normal mb-4" style={{ fontSize: '12px' }}>
                    {event.description}
                  </p>

                  {/* Action Buttons */}
                  {!acceptedStates[event.id] ? (
                    <button 
                      className="w-full py-2 rounded-xl font-bold border-2 bg-[#D01400] border-[#D01400] text-white transition-opacity hover:opacity-80"
                      style={{ fontSize: '13px' }}
                      onClick={() => handleAccept(event.id, currentAttendees)}
                    >
                      Accept
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button 
                        className="w-full py-2 rounded-xl font-bold border-2 bg-[#2C2B36] border-[#D01400] text-[#D01400] cursor-default"
                        style={{ fontSize: '13px' }}
                      >
                        Accepted
                      </button>
                      <button 
                        className="w-full py-2 rounded-xl font-bold border-2 bg-transparent border-gray-600 text-gray-300 transition-opacity hover:opacity-80"
                        style={{ fontSize: '13px' }}
                        onClick={() => handleCancelParticipation(event.id, currentAttendees)}
                      >
                        Cancel Participation
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}